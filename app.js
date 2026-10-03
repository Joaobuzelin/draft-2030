let allPlayers = []; // Guarda todos os jogadores vindos da API

// Função auxiliar para formatar a data (AAAA-MM-DD para MM/DD/AAAA)
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Renderiza a lista de jogadores na tabela
function renderTable(players) {
    const tbody = document.getElementById('players-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    players.forEach(player => {
        // Formatação das estrelas
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<span class="star ${i <= player.stars ? 'active' : ''}">★</span>`;
        }

        // Status de comprometimento
        let schoolHTML = '';
        if (player.college_committed && player.college_committed !== 'Uncommitted') {
            schoolHTML = `
                <div class="committed-cell">
                    <img src="${player.college_logo || 'https://via.placeholder.com/40'}" alt="${player.college_committed}" class="college-logo">
                    <div class="committed-info">
                        <strong class="college-name">${player.college_committed.toUpperCase()}</strong>
                        <span class="committed-status">SIGNED</span>
                    </div>
                </div>
            `;
        } else {
            schoolHTML = `<span class="uncommitted-text">Uncommitted</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="rank-col">${player.rank_position}</td>
            <td class="player-col">
                <a href="#" class="player-name-link">${player.name_player}</a>
                <img src="https://a.espncdn.com/combiner/i?img=/i/recruiting/logos/2025/scn_rankings_logo_100.png&w=60" alt="SCNEXT" class="scnext-badge-img">
            </td>
            <td><strong>${player.position_player}</strong></td>
            <td>
                <div class="hometown-city">${player.hometown}</div>
                <div class="hometown-school">${player.high_school}</div>
            </td>
            <td>${player.height}</td>
            <td>${player.weight_lbs || '-'}</td>
            <td><div class="stars-container">${starsHTML}</div></td>
            <td><strong class="grade-text">${player.grade}</strong></td>
            <td>${schoolHTML}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Busca os recrutas no Node.js
async function fetchPlayers() {
    try {
        const response = await fetch('https://draft-2030-api.onrender.com/api/players');
        allPlayers = await response.json();
        renderTable(allPlayers);
    } catch (error) {
        console.error('Erro ao carregar recrutas:', error);
    }
}

// URLs das imagens dos ícones
const moonIcon = 'https://cdn-icons-png.flaticon.com/512/6393/6393367.png';
const sunIcon = 'https://png.pngtree.com/png-vector/20221128/ourmid/pngtree-icon-of-sun-png-image_6484830.png';

// Alternar Tema (Escuro / Claro)
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

if (themeBtn && themeIcon) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        
        // Troca a imagem do ícone dinamicamente
        themeIcon.src = isLight ? moonIcon : sunIcon;
        themeIcon.alt = isLight ? 'Modo Escuro' : 'Modo Claro';
    });
}

// Evento de busca em tempo real
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        const filteredPlayers = allPlayers.filter(player => {
            const name = player.name_player ? player.name_player.toLowerCase() : '';
            const school = player.high_school ? player.high_school.toLowerCase() : '';
            return name.includes(searchTerm) || school.includes(searchTerm);
        });

        renderTable(filteredPlayers);
    });
}

// ELEMENTOS DO MODAL
const modal = document.getElementById('player-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const addPlayerForm = document.getElementById('add-player-form');

if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Enviar Formulário via POST para a API
if (addPlayerForm) {
    addPlayerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPlayer = {
            rank_position: parseInt(document.getElementById('rank_position').value),
            name_player: document.getElementById('name_player').value,
            position_player: document.getElementById('position_player').value,
            class_year: parseInt(document.getElementById('class_year').value),
            height: document.getElementById('height').value,
            weight_lbs: document.getElementById('weight_lbs').value ? parseInt(document.getElementById('weight_lbs').value) : null,
            high_school: document.getElementById('high_school').value,
            hometown: document.getElementById('hometown').value,
            stars: parseInt(document.getElementById('stars').value),
            grade: parseInt(document.getElementById('grade').value),
            college_id: document.getElementById('college_id').value ? parseInt(document.getElementById('college_id').value) : null,
            commit_date: document.getElementById('commit_date') ? document.getElementById('commit_date').value : null
        };

        try {
            const response = await fetch('https://draft-2030-api.onrender.com/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPlayer)
            });

            if (response.ok) {
                modal.style.display = 'none';
                addPlayerForm.reset();
                fetchPlayers();
            } else {
                alert('Erro ao salvar jogador!');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchPlayers);