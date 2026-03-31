import html2pdf from 'html2pdf.js';

export const generatePdfReport = async (analysis, linkVerification, candidateName = 'Candidate') => {
  const { score, scoreRationale, detectedRole, sectionNotes, keywordMatch, formattingIssues, improvementChecklist, nextSteps } = analysis;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff;">
      
      <!-- Header Area -->
      <div style="border-bottom: 3px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="color: #0A0A0A; margin: 0 0 5px 0; font-size: 32px; font-weight: 800;">Placify AI | ATS Resume Report</h1>
          <p style="margin: 0; color: #5C5550; font-size: 14px;"><strong>Target Role:</strong> ${detectedRole || 'General'}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 12px; color: #A89E94;">Generated for</p>
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${candidateName}</p>
          <p style="margin: 0; font-size: 12px; color: #5C5550;">${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <!-- Score Snapshot -->
      <div style="background: #fdfafa; border: 1px solid #efe8e4; border-radius: 8px; padding: 25px; display: flex; gap: 30px; align-items: center; margin-bottom: 30px;">
        <div style="flex-shrink: 0; text-align: center;">
          <h2 style="font-size: 54px; margin: 0; font-weight: 900; color: ${score >= 75 ? '#22c55e' : score >= 50 ? '#f97316' : '#ef4444'};">${score}</h2>
          <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #5c5550;">ATS MATCH</span>
        </div>
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #111;">Score Rationale</h3>
          <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.5;">${scoreRationale || 'No rationale provided.'}</p>
        </div>
      </div>

      <!-- Priority Next Steps -->
      ${nextSteps ? `
      <div style="background: #fff3ec; border-left: 4px solid #ff6b35; padding: 20px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #d6511e;">🎯 Top Priority Recommended Action</h3>
        <p style="margin: 0; font-size: 14px; color: #5c5550; line-height: 1.6;">${nextSteps}</p>
      </div>` : ''}

      <!-- Detailed Breakdown -->
      <h3 style="font-size: 20px; color: #111; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 20px;">Section by Section Analysis</h3>
      ${sectionNotes ? Object.entries(sectionNotes).map(([key, val]) => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
            <strong style="font-size: 16px; text-transform: capitalize; color: #333;">${key}</strong>
            <span style="font-size: 12px; font-weight: bold; padding: 3px 8px; border-radius: 12px; 
              ${val.status === 'pass' ? 'background: #dcfce7; color: #166534;' : val.status === 'warn' ? 'background: #ffedd5; color: #c2410c;' : 'background: #fee2e2; color: #b91c1c;'}">
              ${val.status.toUpperCase()}
            </span>
          </div>
          <p style="margin: 4px 0; font-size: 14px; color: #555;">${val.note}</p>
          ${val.fix && val.status !== 'pass' ? `<p style="margin: 4px 0; font-size: 13px; color: #d6511e;"><strong>Suggestion:</strong> ${val.fix}</p>` : ''}
        </div>
      `).join('') : '<p>No section analysis available.</p>'}

      <!-- Keyword Analysis -->
      ${keywordMatch ? `
      <h3 style="font-size: 20px; color: #111; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin: 30px 0 20px 0;">Keyword Match (Job Description)</h3>
      <p style="font-size: 14px; color: #555; margin-bottom: 15px;"><strong>Density:</strong> ${keywordMatch.density || 'N/A'}</p>
      
      <div style="display: flex; gap: 20px;">
        ${keywordMatch.matched?.length ? `
        <div style="flex: 1;">
          <strong style="color: #166534; font-size: 14px;">✓ Matched (${keywordMatch.matched.length})</strong>
          <ul style="margin-top: 8px; padding-left: 20px; font-size: 13px; color: #444;">
            ${keywordMatch.matched.map(k => `<li>${k}</li>`).join('')}
          </ul>
        </div>` : ''}
        
        ${keywordMatch.missing?.length ? `
        <div style="flex: 1;">
          <strong style="color: #b91c1c; font-size: 14px;">✗ Missing (${keywordMatch.missing.length})</strong>
          <ul style="margin-top: 8px; padding-left: 20px; font-size: 13px; color: #444;">
            ${keywordMatch.missing.map(k => `<li>${k}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>` : ''}

       <!-- Formatting & Checklist -->
       ${formattingIssues?.length > 0 ? `
       <h3 style="font-size: 20px; color: #111; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin: 30px 0 20px 0;">Formatting Issues Detected</h3>
       <ul style="padding-left: 20px;">
         ${formattingIssues.map(iss => `
           <li style="margin-bottom: 10px;">
             <strong>${iss.issue}</strong> <span style="font-size: 11px; color: #666;">(${iss.severity})</span><br/>
             <span style="font-size: 13px; color: #555;">${iss.detail}</span>
           </li>
         `).join('')}
       </ul>` : ''}

      <!-- Page Footer (Branding) -->
      <div style="margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="font-size: 12px; color: #888; margin: 0;">This report is automatically generated using Placify AI neural parsing.</p>
        <p style="font-size: 12px; color: #888; font-weight: bold; margin: 4px 0;">https://placify-ai.vercel.app</p>
      </div>

    </div>
  `;

  const opt = {
    margin: 10,
    filename: 'ATS_Resume_Analysis_Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().from(htmlContent).set(opt).save();
  } catch (error) {
    console.error("PDF generation failed", error);
  }
};
