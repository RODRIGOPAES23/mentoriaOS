import { readFile } from 'fs/promises'
import { join } from 'path'

export const metadata = {
  title: 'mentoriaOS - Sistema Operacional de Mentoria',
  description: 'Dashboard de mentorados e análise IA',
}

export default async function Home() {
  let htmlBody = ''

  try {
    const filePath = join(process.cwd(), 'index.html')
    const content = await readFile(filePath, 'utf-8')

    // Extract body content from the HTML file
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

    if (bodyMatch) {
      htmlBody = bodyMatch[1]
    }
  } catch (error) {
    htmlBody = '<p>Dashboard não encontrado</p>'
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #0f172a;
          --secondary: #1a1f35;
          --accent: #3b82f6;
          --accent-purple: #a855f7;
          --green: #16a766;
          --danger: #ef4444;
        }

        body {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: #e0e8ff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          min-height: 100vh;
        }

        /* Header */
        header {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(100, 100, 120, 0.3);
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-buttons {
          display: flex;
          gap: 10px;
        }

        button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-mentor {
          background: var(--accent);
          color: white;
        }

        .btn-mentor:hover {
          background: #2563eb;
        }

        .btn-mentorado {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
        }

        .btn-mentorado:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 40px;
        }

        /* Glass Cards */
        .glass {
          background: rgba(30, 40, 60, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(100, 100, 120, 0.3);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .glass:hover {
          background: rgba(30, 40, 60, 0.6);
          border-color: rgba(100, 150, 200, 0.5);
        }

        .section {
          display: none;
        }

        .section.active {
          display: block;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        h1 {
          font-size: 32px;
          margin-bottom: 30px;
          background: linear-gradient(135deg, var(--accent), var(--accent-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        h2 {
          font-size: 20px;
          margin: 20px 0 15px 0;
          color: #c8dcff;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          color: #96a4b4;
          margin-bottom: 8px;
        }

        select, input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(40, 50, 80, 0.6);
          border: 1px solid rgba(100, 150, 200, 0.4);
          border-radius: 10px;
          color: #e0e8ff;
          font-size: 14px;
          margin-bottom: 15px;
        }

        input::placeholder {
          color: #96a4b4;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }

        .metric-card {
          background: rgba(30, 40, 60, 0.5);
          border: 1.5px solid rgba(100, 150, 200, 0.6);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
        }

        .metric-label {
          font-size: 11px;
          font-weight: bold;
          color: #96a4b4;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: #64ff64;
          margin-bottom: 8px;
        }

        .metric-trend {
          font-size: 11px;
          color: #96a4b4;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .info-card {
          background: rgba(25, 45, 85, 0.5);
          border: 1px solid rgba(100, 150, 200, 0.4);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          line-height: 1.8;
        }

        .info-card strong {
          color: #c8dcff;
        }

        .briefing-section {
          margin: 30px 0;
        }

        .briefing-box {
          background: rgba(25, 45, 100, 0.4);
          border: 1.5px solid rgba(120, 150, 200, 0.5);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
        }

        .briefing-title {
          font-size: 12px;
          font-weight: bold;
          color: #ffc464;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .briefing-content {
          font-size: 14px;
          color: #b4bcd2;
          line-height: 1.6;
        }

        .agenda-item {
          margin: 8px 0;
          padding-left: 20px;
          color: #96c8ff;
        }

        footer {
          text-align: center;
          padding: 40px 20px;
          color: #787888;
          font-size: 12px;
        }

        .success-message {
          background: rgba(22, 167, 102, 0.2);
          border: 1px solid var(--green);
          color: #64ff64;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          display: none;
        }

        .success-message.show {
          display: block;
        }

        textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(40, 50, 80, 0.6);
          border: 1px solid rgba(100, 150, 200, 0.4);
          border-radius: 10px;
          color: #e0e8ff;
          font-family: inherit;
          min-height: 100px;
          resize: vertical;
          margin-bottom: 15px;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
      <script dangerouslySetInnerHTML={{__html: `
        function showSection(section) {
          document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
          document.getElementById(section).classList.add('active');
        }

        function updateMetrics() {
          const select = document.getElementById('mentorSelect');
          const content = document.getElementById('mentorContent');
          if (select && select.value) {
            content.style.display = 'block';
          } else if (content) {
            content.style.display = 'none';
          }
        }

        function submitCheckin() {
          const fullName = document.getElementById('fullName');
          const niche = document.getElementById('niche');
          const data = {
            name: fullName ? fullName.value : '',
            niche: niche ? niche.value : '',
            leads: document.getElementById('weeksLeads')?.value || '',
            sales: document.getElementById('weeksSales')?.value || '',
            investment: document.getElementById('weeksInvest')?.value || '',
            videos: document.getElementById('weeksVideos')?.value || '',
            notes: document.getElementById('notes')?.value || '',
            challenges: document.getElementById('challenges')?.value || '',
          };

          if (!data.name || !data.niche) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
          }

          console.log('Check-in enviado:', data);

          const successMsg = document.getElementById('successMessage');
          if (successMsg) {
            successMsg.classList.add('show');
          }

          setTimeout(() => {
            if (fullName) fullName.value = '';
            if (niche) niche.value = '';
            if (document.getElementById('weeksLeads')) document.getElementById('weeksLeads').value = '';
            if (document.getElementById('weeksSales')) document.getElementById('weeksSales').value = '';
            if (document.getElementById('weeksInvest')) document.getElementById('weeksInvest').value = '';
            if (document.getElementById('weeksVideos')) document.getElementById('weeksVideos').value = '';
            if (document.getElementById('notes')) document.getElementById('notes').value = '';
            if (document.getElementById('challenges')) document.getElementById('challenges').value = '';
            if (successMsg) successMsg.classList.remove('show');
          }, 3000);
        }
      `}} />
    </>
  )
}
