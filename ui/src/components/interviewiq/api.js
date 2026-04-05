const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('placifyToken') || '';

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, options = {}, config = {}) => {
  const {
    retries = 0,
    retryDelayMs = 700,
    networkErrorMessage = 'Network request failed. Please check your connection and try again.',
  } = config;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.message || 'Request failed';
        const shouldRetry = response.status >= 500 && response.status <= 599 && attempt < retries;
        if (shouldRetry) {
          await wait(retryDelayMs * (attempt + 1));
          continue;
        }
        throw new Error(message);
      }

      return data;
    } catch (error) {
      lastError = error;

      if (error?.name === 'TypeError' && attempt < retries) {
        await wait(retryDelayMs * (attempt + 1));
        continue;
      }

      if (error?.name === 'TypeError') {
        throw new Error(networkErrorMessage);
      }

      throw error;
    }
  }

  throw lastError || new Error('Request failed');
};

export const interviewIqApi = {
  getProgress: () => fetchJson(`${API_BASE}/api/interviewiq/progress`, { headers: authHeaders() }, { retries: 2 }),
  getDeck: (deckNumber) => fetchJson(`${API_BASE}/api/interviewiq/deck/${deckNumber}`, { headers: authHeaders() }, { retries: 2 }),
  startDeck: (deckNumber) =>
    fetchJson(`${API_BASE}/api/interviewiq/deck/${deckNumber}/start`, {
      method: 'POST',
      headers: authHeaders(),
    }, { retries: 1 }),
  uploadResponse: ({ recordingBlob, questionId, deckId, deckNumber, transcriptHint = '' }) => {
    if (!recordingBlob || recordingBlob.size <= 0) {
      throw new Error('Recording is empty. Please allow camera/microphone access and record again.');
    }

    // Guard against common serverless payload limits that surface as browser-level "Failed to fetch".
    const maxSafeUploadBytes = 4 * 1024 * 1024;
    if (recordingBlob.size > maxSafeUploadBytes) {
      throw new Error('Recording is too large to upload. Please finish your answer a bit earlier and retry.');
    }

    const normalizedBlob = String(recordingBlob.type || '').startsWith('video/')
      ? recordingBlob
      : new Blob([recordingBlob], { type: 'video/webm' });

    const fileName = `response-${Date.now()}.webm`;
    const uploadBlob = typeof File !== 'undefined'
      ? new File([normalizedBlob], fileName, { type: 'video/webm' })
      : normalizedBlob;

    const formData = new FormData();
    formData.append('recording', uploadBlob, fileName);
    formData.append('questionId', questionId);
    formData.append('deckId', deckId);
    formData.append('deckNumber', String(deckNumber));
    formData.append('transcriptHint', transcriptHint);

    return fetchJson(`${API_BASE}/api/interviewiq/response/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    }, {
      retries: 0,
      networkErrorMessage: 'Upload failed due to network/server limit. Please click Finish Answer earlier and retry.',
    });
  },
  getResponse: (responseId) =>
    fetchJson(`${API_BASE}/api/interviewiq/response/${responseId}`, {
      headers: authHeaders(),
    }, { retries: 2, retryDelayMs: 900 }),
  getDeckResults: (deckNumber) =>
    fetchJson(`${API_BASE}/api/interviewiq/deck/${deckNumber}/results`, {
      headers: authHeaders(),
    }, { retries: 2, retryDelayMs: 900 }),
  getHeatmap: () => fetchJson(`${API_BASE}/api/interviewiq/heatmap`, { headers: authHeaders() }, { retries: 2 }),
};
