const answers = {};
let currentStep = 0;

function goToStep(n) {
  document.getElementById('step' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('step' + currentStep).classList.add('active');
  updateProgress();
  window.scrollTo({ top: document.getElementById('quiz').offsetTop - 20, behavior: 'smooth' });
}

function updateProgress() {
  for (let i = 0; i < 5; i++) {
    document.getElementById('dot' + i).classList.toggle('done', i <= currentStep);
  }
}

function selectOpt(el, step, value) {
  el.closest('.quiz-options').querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers['q' + step] = value;
  const btn = document.getElementById('next' + step);
  if (btn) btn.disabled = false;
}

function checkStep4() {
  const name = document.getElementById('clientName').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  document.getElementById('next4').disabled = !(name && email.includes('@'));
}

function buildRecommendation() {
  let tier = 'Tier 2 — Full Launch Package';
  let price = '$9,500';
  let note = 'One-time setup + $3,500/mo ongoing management';
  let detail = '';

  if (answers.q1 === 'long' || answers.q1 === 'unsure') {
    detail += 'First thing we tackle together: finding a short web address that works on any phone — fast to say, easy to type, impossible to forget. We handle that as part of your strategy session at no extra cost. ';
  }
  if (answers.q3 === 'low') {
    detail += 'Since your team prefers simplicity, we build a fully managed setup. You never touch a dashboard unless you want to. We handle everything. ';
  }
  if (answers.q2 === 'all') {
    detail += 'You have multiple revenue goals — donations, merch, and events. That means you need a real foundation, not a quick landing page. Tier 2 covers all of it from day one.';
  } else if (answers.q2 === 'donate') {
    detail += 'Your donation path will be front and center — clear, trusted, and easy on any device. We make sure no one leaves your site without knowing exactly how to support the mission.';
  } else if (answers.q2 === 'merch') {
    detail += 'We build your storefront with up to 10 fully optimized listings — legacy gear, memorabilia, signed items — all set up to sell from day one.';
  }

  return { tier, price, note, detail };
}

async function submitQuiz() {
  const name = document.getElementById('clientName').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const org = document.getElementById('clientOrg').value.trim();

  answers.name = name;
  answers.email = email;

  document.getElementById('step4').classList.remove('active');
  document.getElementById('stepResult').classList.add('active');
  document.getElementById('submitStatus').style.display = 'block';
  document.getElementById('resultBox').style.display = 'none';
  updateProgress();
  window.scrollTo({ top: document.getElementById('quiz').offsetTop - 20, behavior: 'smooth' });

  const rec = buildRecommendation();

  try {
    const { data, error } = await sb
      .from('proposal_leads')
      .insert([{
        client_name: name,
        client_email: email,
        client_org: org || "IU '76 Team Legacy Initiative",
        q0_site_status: answers.q0,
        q1_domain: answers.q1,
        q2_goal: answers.q2,
        q3_tech_level: answers.q3,
        recommended_tier: rec.tier,
        recommended_price: rec.price,
        status: 'new'
      }])
      .select()
      .single();

    document.getElementById('submitStatus').style.display = 'none';
    document.getElementById('resultBox').style.display = 'block';
    document.getElementById('resultTitle').textContent = 'Your Plan Is Ready, ' + name.split(' ')[0] + '.';
    document.getElementById('recTier').textContent = rec.tier;
    document.getElementById('recPrice').textContent = rec.price;
    document.getElementById('recNote').textContent = rec.note;
    document.getElementById('resultDetail').textContent = rec.detail;

    if (data && data.access_token) {
      const link = window.location.origin + window.location.pathname + '?token=' + data.access_token;
      document.getElementById('tokenLink').textContent = link;
      document.getElementById('tokenLinkBox').style.display = 'block';
    }
  } catch (err) {
    console.error('Submit error:', err);
    document.getElementById('submitStatus').style.display = 'none';
    document.getElementById('resultBox').style.display = 'block';
    document.getElementById('resultTitle').textContent = 'Your Plan Is Ready, ' + name.split(' ')[0] + '.';
    document.getElementById('recTier').textContent = rec.tier;
    document.getElementById('recPrice').textContent = rec.price;
    document.getElementById('recNote').textContent = rec.note;
    document.getElementById('resultDetail').textContent = rec.detail;
  }
}

async function confirmReady() {
  if (sb && answers.email) {
    await sb.from('proposal_leads').update({ status: 'confirmed' }).eq('client_email', answers.email);
  }
  document.getElementById('resultBox').innerHTML = `
    <div class="result-icon">✅</div>
    <h2 style="color:var(--gold);">Next Steps</h2>
    <p>Check your email within the hour. We'll send a personal link to discuss your recommendation with our team.</p>
    <p style="margin-top:20px; font-size:13px; color:var(--text-dim);">Your initial consultation is complimentary (up to 30 minutes). Strategy sessions beyond 30 minutes are billed at $150/hour.</p>
    <a href="https://www.swrvonthego.pro" style="display:inline-block; margin-top:24px; padding:14px 32px; background:var(--gold); color:#000; text-decoration:none; border-radius:4px; font-weight:600; font-size:13px; letter-spacing:0.08em; text-transform:uppercase;">Learn More at SWRV On The Go →</a>
    <p style="margin-top:24px; font-size:12px; color:#555;">— Freedom Fix Solutions × SWRV On The Go LLC</p>
  `;
}
