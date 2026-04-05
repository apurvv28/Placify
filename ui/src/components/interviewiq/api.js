const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('placifyToken') || '';

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const fetchJson = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error?.name === 'TypeError') {
      throw new Error('Network upload failed. Please check your connection and try a shorter recording.');
    }
    throw error;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export const interviewIqApi = {
  getProgress: () => fetchJson(`${API_BASE}/api/interviewiq/progress`, { headers: authHeaders() }),
  getDeck: (deckNumber) => fetchJson(`${API_BASE}/api/interviewiq/deck/${deckNumber}`, { headers: authHeaders() }),
  startDeck: (deckNumber) =>
    fetchJson(`${API_BASE}/api/interviewiq/deck/${deckNumber}/start`, {
      method: 'POST',
      headers: authHeaders(),
    }),
  uploadResponse: ({ recordingBlob, questionId, deckId, deckNumber, transcriptHint = '' }) => {
    if (!recordingBlob || recordingBlob.size <= 0) {
      throw new Error('Recording is empty. Please allow camera/microphone access and record again.');
    }

    // Guard against common serverless payload limits that surface as browser-level "Failed to fetch".
    const maxSafeUploadBytes = 7 * 1024 * 1024;
    if (recordingBlob.size > maxSafeUploadBytes) {
      throw new Error('Recording is too large to upload. Please finish your answer a bit earlier and retry.');
    }

    const formData = new FormData();
    formData.append('recording', recordingBlob, `response-${Date.now()}.webm`);
    formData.append('questionId', questionId);
    formData.append('deckId', deckId);
    formData.append('deckNumber', String(deckNumber));
    formData.append('transcriptHint', transcriptHint);

    return fetchJson(`${API_BASE}/api/interviewiq/response/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
  },
  getResponse: (responseId) =>
    fetchJson(`${API_BASE}/api/interviewiq/response/${responseId}`, {
      headers: authHeaders(),
    }),
  getDeckResults: (deckNumber) =>
    fetchJson(`${API_BASE}/api/interviewiq/deck/${deckNumber}/results`, {
      headers: authHeaders(),
    }),
  getHeatmap: () => fetchJson(`${API_BASE}/api/interviewiq/heatmap`, { headers: authHeaders() }),
};
