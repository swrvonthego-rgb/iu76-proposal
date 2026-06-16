async function loadClientView(token) {
  document.getElementById('mainSite').style.display = 'none';
  document.getElementById('accessView').classList.add('active');

  try {
    const { data, error } = await sb
      .from('proposal_leads')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !data) {
      document.getElementById('accessContent').innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-dim);">
          <p style="font-size:16px; margin-bottom:16px;">This link doesn't match any proposal on file.</p>
          <a href="${window.location.pathname}" style="color:var(--gold); font-size:14px;">Go to main proposal →</a>
        </div>`;
      return;
    }

    const goalMap = { donate:'Donations & contributions', merch:'Merchandise & memorabilia', events:'Events & registrations', all:'Full ecosystem (donations, merch, and events)' };
    const techMap = { low:'Fully managed — hands off', mid:'Semi-managed — some self-service', high:'Self-managed with support' };
    const siteMap = { 'no-site':'No website yet', 'old-site':'Existing site needing upgrade', 'good-site':'Existing site, not generating revenue' };
    const domainMap = { short:'Short and simple (ready to go)', long:'Full organization name (needs shortening)', unsure:'Not decided yet' };

    document.getElementById('accessContent').innerHTML = `
      <div class="success-banner">✦ Your proposal is saved and always accessible at this link.</div>
      <div class="access-card">
        <div class="a-label">Submitted By</div>
        <div class="a-val">${data.client_name}</div>
        <div class="a-sub">${data.client_email} &nbsp;·&nbsp; ${data.client_org || ''}</div>
      </div>
      <div class="access-card" style="border-color:var(--gold); background:linear-gradient(160deg,rgba(255,215,0,0.06),var(--marble));">
        <div class="a-label">Your Recommendation</div>
        <div class="a-val" style="color:var(--gold); font-size:26px;">${data.recommended_tier}</div>
        <div class="a-val" style="font-size:32px; font-family:'Playfair Display',serif; color:var(--platinum);">${data.recommended_price}</div>
        <div class="a-sub" style="margin-top:4px;">one-time + $3,500/mo ongoing management</div>
      </div>
      <div class="access-grid">
        <div class="access-card">
          <div class="a-label">Current Website</div>
          <div class="a-val" style="font-size:15px;">${siteMap[data.q0_site_status] || data.q0_site_status}</div>
        </div>
        <div class="access-card">
          <div class="a-label">Domain/URL Status</div>
          <div class="a-val" style="font-size:15px;">${domainMap[data.q1_domain] || data.q1_domain}</div>
        </div>
        <div class="access-card">
          <div class="a-label">Primary Goal</div>
          <div class="a-val" style="font-size:15px;">${goalMap[data.q2_goal] || data.q2_goal}</div>
        </div>
        <div class="access-card">
          <div class="a-label">Management Style</div>
          <div class="a-val" style="font-size:15px;">${techMap[data.q3_tech_level] || data.q3_tech_level}</div>
        </div>
      </div>
      <div class="access-card" style="text-align:center;">
        <div class="a-label" style="margin-bottom:16px;">Status</div>
        <div style="display:inline-block; padding:8px 24px; border-radius:100px; font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
          background:${data.status === 'confirmed' ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)'};
          color:${data.status === 'confirmed' ? 'var(--gold)' : 'var(--text-dim)'};
          border:1px solid ${data.status === 'confirmed' ? 'var(--gold)' : 'var(--border)'};">
          ${data.status === 'confirmed' ? '✦ Confirmed — We Are Moving Forward' : '⏳ Awaiting Your Decision'}
        </div>
        ${data.status !== 'confirmed' ? `
        <div style="margin-top:20px;">
          <button class="tier-btn primary" style="max-width:300px;margin:0 auto;" onclick="confirmFromAccess('${data.access_token}')">
            Confirm — I'm Ready to Move Forward
          </button>
        </div>` : ''}
      </div>
      <div style="text-align:center; margin-top:40px;">
        <a href="${window.location.pathname}" style="color:var(--text-dim); font-size:13px; text-decoration:none;">← View full proposal</a>
      </div>
    `;
  } catch(err) {
    document.getElementById('accessContent').innerHTML = `<div class="loading-msg">Error loading proposal. Please try again.</div>`;
  }
}

async function confirmFromAccess(token) {
  await sb.from('proposal_leads').update({ status: 'confirmed' }).eq('access_token', token);
  loadClientView(token);
}
