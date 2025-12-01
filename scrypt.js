let userData = {
    nome: '',
    investimentos: [],
    metas: [],
    metaConcluidas: [],
    xp: 0,
    nivel: 1,
    metaTotal: 0,
    conquistas: [],
    reservaEmergencia: false
};

function init() {
    carregarDados();
    setDataAtual();
    atualizarInterface();
}

function carregarDados() {
    const saved = localStorage.getItem('2money_data');
    if (saved) {
        userData = JSON.parse(saved);
        document.getElementById('modal-participacao').classList.remove('show');
    }
}

function salvarDados() {
    localStorage.setItem('2money_data', JSON.stringify(userData));
}
 function setDataAtual() {
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('data-investimento').value = hoje;
        }

        function iniciarParticipacao() {
            const nome = document.getElementById('nome-usuario').value.trim();
            const meta = parseFloat(document.getElementById('meta-inicial').value);
            const investimentoInicial = parseFloat(document.getElementById('investimento-inicial').value) || 0;
            const iniciarReserva = document.getElementById('iniciar-reserva').checked;
            
            if (!nome) {
                alert('Por favor, informe seu nome!');
                return;
            }
            
            if (!meta || meta <= 0) {
                alert('Por favor, defina uma meta válida!');
                return;
            }
            
            userData.nome = nome;
            userData.metaTotal = meta;
            userData.reservaEmergencia = iniciarReserva;
            userData.conquistas.push('🚀 Iniciante');
            
            // Se tiver investimento inicial, adicionar
            if (investimentoInicial > 0) {
                const dataInicial = {
                    id: Date.now(),
                    valor: investimentoInicial,
                    data: new Date().toISOString().split('T')[0],
                    descricao: 'Investimento Inicial'
                };
                userData.investimentos.push(dataInicial);
                userData.xp += 100; // Bonus por começar com investimento
            }
            
            // Bonus por iniciar reserva de emergência
            if (iniciarReserva) {
                userData.conquistas.push('🛡️ Reserva Iniciada');
                userData.xp += 150;
            }
            
            verificarNivel();
            salvarDados();
            
            document.getElementById('modal-participacao').classList.remove('show');
            atualizarInterface();
            alert(`🎉 Bem-vindo ${nome}! Sua jornada começa agora!`);
        }

        function abrirModalInvestimento() {
            setDataAtual();
            document.getElementById('modal-investimento').classList.add('show');
        }

        function abrirModalEditarMeta() {
            document.getElementById('editar-nome').value = userData.nome;
            document.getElementById('editar-meta').value = userData.metaTotal;
            document.getElementById('modal-editar-meta').classList.add('show');
        }

        function salvarEdicaoMeta() {
            const novoNome = document.getElementById('editar-nome').value.trim();
            const novaMeta = parseFloat(document.getElementById('editar-meta').value);
            
            if (!novoNome) {
                alert('Por favor, informe seu nome!');
                return;
            }
            
            if (!novaMeta || novaMeta <= 0) {
                alert('Por favor, defina uma meta válida!');
                return;
            }
            
            userData.nome = novoNome;
            userData.metaTotal = novaMeta;
            salvarDados();
            atualizarInterface();
            fecharModal('modal-editar-meta');
            alert('✅ Meta atualizada com sucesso!');
        }

        function abrirModalMeta() {
            document.getElementById('modal-meta').classList.add('show');
        }

        function fecharModal(id) {
            document.getElementById(id).classList.remove('show');
        }

        function salvarInvestimento() {
            const valor = parseFloat(document.getElementById('valor-investimento').value);
            const data = document.getElementById('data-investimento').value;
            const descricao = document.getElementById('descricao-investimento').value || 'Investimento';

            if (!valor || valor <= 0) {
                alert('Por favor, informe um valor válido!');
                return;
            }

            if (!data) {
                alert('Por favor, informe a data!');
                return;
            }

            const investimento = {
                id: Date.now(),
                valor: valor,
                data: data,
                descricao: descricao
            };

            userData.investimentos.push(investimento);
            
            // Verificar conquistas
            const total = calcularTotalInvestido();
            if (total >= 1000 && !userData.conquistas.includes('💰 Primeiro Mil')) {
                userData.conquistas.push('💰 Primeiro Mil');
                userData.xp += 200;
                alert('🎉 Conquista Desbloqueada: Primeiro Mil! +200 XP');
            }
            if (total >= userData.metaTotal && !userData.conquistas.includes('🎯 Meta Alcançada')) {
                userData.conquistas.push('🎯 Meta Alcançada');
                userData.xp += 500;
                alert('🎉 Conquista Desbloqueada: Meta Alcançada! +500 XP');
            }

            verificarNivel();
            salvarDados();
            atualizarInterface();
            fecharModal('modal-investimento');
            
            // Limpar form
            document.getElementById('valor-investimento').value = '';
            document.getElementById('descricao-investimento').value = '';
        }

        function excluirInvestimento(id) {
            if (!confirm('Deseja realmente excluir este investimento?')) return;
            
            userData.investimentos = userData.investimentos.filter(inv => inv.id !== id);
            salvarDados();
            atualizarInterface();
        }

        function editarInvestimento(id) {
            const investimento = userData.investimentos.find(inv => inv.id === id);
            if (!investimento) return;

            const novoValor = prompt('Novo valor:', investimento.valor);
            if (novoValor && parseFloat(novoValor) > 0) {
                investimento.valor = parseFloat(novoValor);
                salvarDados();
                atualizarInterface();
            }
        }

        function salvarMeta() {
            const titulo = document.getElementById('titulo-meta').value;
            const xp = parseInt(document.getElementById('xp-meta').value);
            const emoji = document.getElementById('emoji-meta').value || '🎯';

            if (!titulo) {
                alert('Por favor, informe o título da meta!');
                return;
            }

            const meta = {
                id: Date.now(),
                titulo: titulo,
                xp: xp,
                emoji: emoji,
                concluida: false
            };

            userData.metas.push(meta);
            salvarDados();
            atualizarInterface();
            fecharModal('modal-meta');
            
            // Limpar form
            document.getElementById('titulo-meta').value = '';
            document.getElementById('xp-meta').value = '100';
            document.getElementById('emoji-meta').value = '';
        }

        function concluirMeta(id) {
            const meta = userData.metas.find(m => m.id === id);
            if (!meta || meta.concluida) return;

            meta.concluida = true;
            userData.metaConcluidas.push(id);
            userData.xp += meta.xp;

            // Verificar conquista de metas
            if (userData.metaConcluidas.length >= 5 && !userData.conquistas.includes('⭐ 5 Metas')) {
                userData.conquistas.push('⭐ 5 Metas');
                userData.xp += 300;
                alert('🎉 Conquista Desbloqueada: 5 Metas Concluídas! +300 XP');
            }

            verificarNivel();
            salvarDados();
            atualizarInterface();
            alert(`✅ Meta concluída! +${meta.xp} XP`);
        }

        function excluirMeta(id) {
            if (!confirm('Deseja realmente excluir esta meta?')) return;
            
            userData.metas = userData.metas.filter(m => m.id !== id);
            userData.metaConcluidas = userData.metaConcluidas.filter(mid => mid !== id);
            salvarDados();
            atualizarInterface();
        }

        function verificarNivel() {
            const xpPorNivel = 500; // XP necessário por nível
            const novoNivel = Math.floor(userData.xp / xpPorNivel) + 1;
            
            if (novoNivel > userData.nivel) {
                const niveisGanhos = novoNivel - userData.nivel;
                userData.nivel = novoNivel;
                
                // Adicionar conquistas por nível
                if (userData.nivel === 2 && !userData.conquistas.includes('⭐ Nível 2')) {
                    userData.conquistas.push('⭐ Nível 2');
                }
                if (userData.nivel === 3 && !userData.conquistas.includes('⭐⭐ Nível 3')) {
                    userData.conquistas.push('⭐⭐ Nível 3');
                }
                if (userData.nivel === 5 && !userData.conquistas.includes('🌟 Nível 5')) {
                    userData.conquistas.push('🌟 Nível 5');
                }
                if (userData.nivel === 10 && !userData.conquistas.includes('💎 Nível 10')) {
                    userData.conquistas.push('💎 Nível 10');
                }
                if (userData.nivel === 15 && !userData.conquistas.includes('👑 Nível 15')) {
                    userData.conquistas.push('👑 Nível 15');
                }
                if (userData.nivel === 20 && !userData.conquistas.includes('🏆 Mestre')) {
                    userData.conquistas.push('🏆 Mestre');
                }
                
                alert(`🎉 Parabéns! Você subiu para o Nível ${userData.nivel}!`);
            }
        }

        function calcularTotalInvestido() {
            return userData.investimentos.reduce((sum, inv) => sum + inv.valor, 0);
        }

        function atualizarInterface() {
            // Atualizar nome do usuário
            const nomeDisplay = document.getElementById('user-name-display');
            if (userData.nome) {
                nomeDisplay.textContent = `Olá, ${userData.nome}! 👋`;
            }
            
            // Atualizar investimentos
            const total = calcularTotalInvestido();
            const percentual = userData.metaTotal > 0 ? (total / userData.metaTotal * 100) : 0;
            const falta = Math.max(0, userData.metaTotal - total);

            document.getElementById('total-investido').textContent = formatMoney(total);
            document.getElementById('meta-valor').textContent = formatMoney(userData.metaTotal);
            document.getElementById('percentual-meta').textContent = percentual.toFixed(1) + '%';
            document.getElementById('falta-valor').textContent = 'Falta: ' + formatMoney(falta);
            
            const fill = document.getElementById('grafico-progresso');
            const percentage = Math.min(100, percentual);
            fill.style.width = percentage + '%';
            fill.textContent = percentage.toFixed(1) + '%';
            
            // Cor do gráfico baseada no progresso
            if (percentage >= 100) {
                fill.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
            } else if (percentage >= 75) {
                fill.style.background = 'linear-gradient(90deg, #2196F3, #1976D2)';
            } else if (percentage >= 50) {
                fill.style.background = 'linear-gradient(90deg, #FF9800, #F57C00)';
            } else {
                fill.style.background = 'linear-gradient(90deg, #f44336, #d32f2f)';
            }

            // Lista de investimentos
            const listaInv = document.getElementById('investimentos-lista');
            if (userData.investimentos.length === 0) {
                listaInv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhum investimento registrado ainda</p>';
            } else {
                listaInv.innerHTML = userData.investimentos
                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                    .map(inv => `
                        <div class="investimento-item">
                            <div class="investimento-info">
                                <div class="investimento-valor">${formatMoney(inv.valor)}</div>
                                <div class="investimento-data">${inv.descricao} - ${formatDate(inv.data)}</div>
                            </div>
                            <div class="investimento-acoes">
                                <button class="btn btn-warning" onclick="editarInvestimento(${inv.id})">✏️</button>
                                <button class="btn btn-danger" onclick="excluirInvestimento(${inv.id})">🗑️</button>
                            </div>
                        </div>
                    `).join('');
            }

            // Atualizar metas
            document.getElementById('xp-total').textContent = userData.xp + ' XP';
            document.getElementById('metas-concluidas').textContent = userData.metaConcluidas.length;
            document.getElementById('nivel-badge').textContent = `Nível ${userData.nivel}`;

            const listaMetas = document.getElementById('metas-lista');
            if (userData.metas.length === 0) {
                listaMetas.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhuma meta criada ainda</p>';
            } else {
                listaMetas.innerHTML = userData.metas.map(meta => `
                    <div class="meta-item ${meta.concluida ? 'completed' : ''}">
                        <div class="meta-info">
                            <div style="display: flex; align-items: center;">
                                <span class="meta-icon">${meta.emoji}</span>
                                <div>
                                    <strong style="font-size: 1.1em;">${meta.titulo}</strong>
                                    <div class="meta-xp">+${meta.xp} XP</div>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            ${meta.concluida ? 
                                '<span style="font-size: 2em;">✅</span>' : 
                                `<button class="btn btn-success" onclick="concluirMeta(${meta.id})">Concluir</button>`
                            }
                            <button class="btn btn-danger" onclick="excluirMeta(${meta.id})">🗑️</button>
                        </div>
                    </div>
                `).join('');
            }

            // Atualizar conquistas
            const listaConquistas = document.getElementById('conquistas-lista');
            if (userData.conquistas.length === 0) {
                listaConquistas.innerHTML = '<p style="color: #999; font-size: 0.9em;">Nenhuma conquista ainda</p>';
            } else {
                listaConquistas.innerHTML = userData.conquistas.map(c => 
                    `<span class="conquista-item">${c}</span>`
                ).join('');
            }

            // Atualizar barra de XP e nível
            const xpPorNivel = 500;
            const xpAtual = userData.xp % xpPorNivel;
            const xpProximo = xpPorNivel;
            const percentualXP = (xpAtual / xpProximo) * 100;

            document.getElementById('xp-atual').textContent = `${xpAtual} XP`;
            document.getElementById('xp-proximo').textContent = `${xpProximo} XP`;
            document.getElementById('xp-bar-fill').style.width = `${percentualXP}%`;
        }

        function formatMoney(value) {
            return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('pt-BR');
        }

        // Inicializar ao carregar
        window.onload = init;
