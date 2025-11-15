// File: app_semplice.js (Versione Finale e Corretta)

document.addEventListener('DOMContentLoaded', initializeApp);

// -----------------------------------------------------------
// 🔑 CREDENZIALI DEL BIN JSON (VERIFICA I TUOI DATI QUI) 🔑
// -----------------------------------------------------------
const BIN_ID = '69190269d0ea881f40ead544';
// La Master Key è necessaria per poter scrivere/aggiornare il bin.
const MASTER_KEY = '$2a$10$/oqt/konWBpXfYJhVx2EHONSYiQZCSS8PCD7IqU3yPAkckNuE8lP2'; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// -----------------------------------------------------------
// Variabili Globali per Memorizzare i Dati Caricati
// -----------------------------------------------------------
let GLOBAL_SPESE = [];
let GLOBAL_CATALOGO = [];
let GLOBAL_BUDGET = {};

// --- Costanti Categorie ---
const CATEGORIE = [
    "carne", "formaggio", "affettati", "albume", "legumi", "frutta", 
    "verdura", "grassi", "yogurt", "latte", "dessert", "carboidrati", "biscotti"
];

// --- Elementi DOM Comuni ---
const supermercatiList = document.getElementById('supermercatiList');

// -----------------------------------------------------------
// 🌐 FUNZIONI DI GESTIONE DATI REMOTI (FETCH API) 🌐
// -----------------------------------------------------------

async function fetchInitialData() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': MASTER_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Errore di rete: ${response.status}`);
        }

        const jsonResponse = await response.json();
        const record = jsonResponse.record || {};

        GLOBAL_SPESE = Array.isArray(record.spese) ? record.spese : [];
        GLOBAL_CATALOGO = Array.isArray(record.catalogo) ? record.catalogo : [];
        GLOBAL_BUDGET = record.budget && typeof record.budget === 'object' ? record.budget : {};
        
        return true;
        
    } catch (error) {
        console.error("ERRORE CRITICO: Impossibile caricare i dati dal bin.", error);
        GLOBAL_SPESE = [];
        GLOBAL_CATALOGO = [];
        GLOBAL_BUDGET = {};
        return false;
    }
}

async function saveAllDataToBin() {
    const dataToSave = {
        spese: GLOBAL_SPESE,
        catalogo: GLOBAL_CATALOGO,
        budget: GLOBAL_BUDGET
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY 
            },
            body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
            throw new Error(`Errore di rete durante il salvataggio: ${response.status}`);
        }

        console.log("Dati salvati con successo nel bin.");
        return true;
        
    } catch (error) {
        console.error("ERRORE nel salvataggio dei dati sul bin.", error);
        return false;
    }
}

function updateSupermercatiDatalist() {
    const nomiSupermercati = new Set();
    GLOBAL_SPESE.forEach(spesa => nomiSupermercati.add(spesa.supermercato));
    GLOBAL_CATALOGO.forEach(p => nomiSupermercati.add(p.supermercatoRiferimento));

    if (supermercatiList) {
        supermercatiList.innerHTML = '';
        nomiSupermercati.forEach(nome => {
            if(nome) { 
                const option = document.createElement('option');
                option.value = nome;
                supermercatiList.appendChild(option);
            }
        });
    }
}

// -----------------------------------------------------------
// 🔄 INIZIALIZZAZIONE E LOGICA PRINCIPALE 🔄
// -----------------------------------------------------------

async function initializeApp() {
    await fetchInitialData();
    
    // Controlla quale pagina è stata caricata
    if (document.getElementById('spesaForm')) {
        initializeSpesaPage();
    } else if (document.getElementById('prodottoForm')) {
        initializeCatalogoPage();
    }
    
    updateSupermercatiDatalist();
}

// -----------------------------------------------------------
// LOGICA SPECIFICA PER index_semplice.html
// -----------------------------------------------------------
function initializeSpesaPage() {
    
    // DICHIARAZIONE DI TUTTI GLI ELEMENTI DOM NECESSARI
    const articoliContainer = document.getElementById('articoliContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const spesaForm = document.getElementById('spesaForm');
    const totaleProvvisorioElement = document.getElementById('totaleProvvisorio');
    const supermercatoInput = document.getElementById('supermercato');
    const dataAcquistoInput = document.getElementById('dataAcquisto'); 
    const spesaIdModificaInput = document.getElementById('spesaIdModifica'); 
    const submitSpesaBtn = document.getElementById('submitSpesaBtn'); 
    const messaggioStato = document.getElementById('messaggioStato');
    const messaggioSpesaGestione = document.getElementById('messaggioSpesaGestione'); 
    const speseBody = document.getElementById('speseBody'); 
    const speseTable = document.getElementById('speseTable');
    const budgetForm = document.getElementById('budgetForm');
    const messaggioBudget = document.getElementById('messaggioBudget');
    const ottieniReportBtn = document.getElementById('ottieniReportBtn');
    const risultatoReport = document.getElementById('risultatoReport');
    const meseReportInput = document.getElementById('meseReport');
    const annoReportInput = document.getElementById('annoReport');
    const selettoreCatalogo = document.getElementById('selettoreCatalogo');
    const aggiungiDaCatalogoBtn = document.getElementById('aggiungiDaCatalogoBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    // FINE DICHIARAZIONE DOM

    function updateCatalogoDropdown() {
        if (!selettoreCatalogo) return;
        selettoreCatalogo.innerHTML = '<option value="">-- Seleziona un Prodotto dal Catalogo --</option>';
        GLOBAL_CATALOGO.forEach(prodotto => {
            const option = document.createElement('option');
            option.value = prodotto.id;
            option.textContent = `${prodotto.nome} (${prodotto.prezzoBase.toFixed(2)} €) @ ${prodotto.supermercatoRiferimento} [${prodotto.categoria}]`;
            selettoreCatalogo.appendChild(option);
        });
    }

    function addItemRow(articolo = {}) {
        if (!articoliContainer) return;

        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="text" class="nomeAlimento" placeholder="Nome Articolo" value="${articolo.nome || ''}" required>
            <input type="number" class="quantita" placeholder="Quantità" step="0.01" min="0.01" value="${articolo.quantita || ''}" required>
            <input type="number" class="prezzoUnitario" placeholder="Prezzo/Unità" step="0.01" min="0.01" value="${articolo.prezzoUnitario || ''}" required>
            <input type="number" class="scontoPercentuale" placeholder="Sconto (%)" step="0.01" min="0" max="100" value="${articolo.sconto || 0}">
            <input type="number" class="costoRiga" placeholder="Totale Riga" value="${articolo.costoTotale ? articolo.costoTotale.toFixed(2) : ''}" readonly>
            <button type="button" class="removeItemBtn">🗑️</button>
        `;
        
        articoliContainer.appendChild(row);

        const inputs = row.querySelectorAll('.quantita, .prezzoUnitario, .scontoPercentuale');
        inputs.forEach(input => input.addEventListener('input', updateTotals));
        if(articolo.nome) updateTotals(); 

        row.querySelector('.removeItemBtn').addEventListener('click', () => {
            row.remove();
            updateTotals();
        });
    }
    
    function updateTotals() {
        if (!totaleProvvisorioElement || !articoliContainer) return;

        let totaleGenerale = 0;
        const righeArticolo = articoliContainer.querySelectorAll('.item-row');

        righeArticolo.forEach(row => {
            const quantita = parseFloat(row.querySelector('.quantita').value) || 0;
            const prezzoUnitario = parseFloat(row.querySelector('.prezzoUnitario').value) || 0;
            const scontoPercentuale = parseFloat(row.querySelector('.scontoPercentuale').value) || 0;

            const costoLordo = quantita * prezzoUnitario;
            const costoRiga = costoLordo * (1 - scontoPercentuale / 100); 

            row.querySelector('.costoRiga').value = costoRiga.toFixed(2);
            totaleGenerale += costoRiga;
        });

        totaleProvvisorioElement.textContent = totaleGenerale.toFixed(2) + ' €';
    }

    // NUOVA FUNZIONE: Raggruppa tutte le spese per Giorno E Supermercato
    function getSpesePerGiornoESupermercato() {
        const riepilogo = {};
        
        GLOBAL_SPESE.forEach(spesa => {
            const chiave = `${spesa.data}|${spesa.supermercato}`; 
            
            if (!riepilogo[chiave]) {
                riepilogo[chiave] = {
                    chiave: chiave,
                    data: spesa.data,
                    supermercato: spesa.supermercato,
                    totaleGenerale: 0,
                    numeroAcquistiSingoli: 0,
                    spesaIds: [],
                    dettagliArticoli: []
                };
            }
            
            riepilogo[chiave].totaleGenerale += spesa.totaleSpesa;
            riepilogo[chiave].numeroAcquistiSingoli += 1;
            riepilogo[chiave].spesaIds.push(spesa.id);
            
            spesa.articoli.forEach(articolo => {
                riepilogo[chiave].dettagliArticoli.push({
                    ...articolo,
                    dataAcquisto: spesa.data,
                    spesaId: spesa.id
                });
            });
        });
        
        return Object.values(riepilogo).sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    
    // FUNZIONE SOSTITUITA: Mostra il riepilogo per Giorno e Supermercato
    function renderSpeseTable() {
        if (!speseBody || !speseTable) return;

        const riepiloghi = getSpesePerGiornoESupermercato();
        speseBody.innerHTML = '';
        
        const tableHeader = speseTable.querySelector('thead tr');
        tableHeader.innerHTML = '<th>Data</th><th>Supermercato</th><th>Totale Spesa</th><th>Articoli Totali</th><th>Azioni</th>';

        riepiloghi.forEach(riepilogo => {
            const row = speseBody.insertRow();
            
            row.insertCell().textContent = riepilogo.data;
            row.insertCell().innerHTML = `<strong>${riepilogo.supermercato}</strong> 
                                        ${riepilogo.numeroAcquistiSingoli > 1 ? `<span style="color: blue;">(${riepilogo.numeroAcquistiSingoli} scontrini)</span>` : ''}`;
            
            row.insertCell().textContent = riepilogo.totaleGenerale.toFixed(2) + ' €';
            row.insertCell().textContent = riepilogo.dettagliArticoli.length;
            
            const azioniCell = row.insertCell();
            
            const btnModifica = document.createElement('button');
            btnModifica.textContent = '🔍 Dettagli / Modifica';
            btnModifica.className = 'btn-modifica-riepilogo';
            // Collegamento alla funzione interna (Fix per l'attivazione)
            btnModifica.onclick = () => caricaRiepilogoPerModifica(riepilogo.data, riepilogo.supermercato); 
            azioniCell.appendChild(btnModifica);

            const btnEliminaTutto = document.createElement('button');
            btnEliminaTutto.textContent = '🗑️ Elimina Gruppo';
            btnEliminaTutto.className = 'btn-elimina-gruppo';
            // Collegamento alla funzione interna
            btnEliminaTutto.onclick = () => eliminaRiepilogoGiornoESupermercato(riepilogo.spesaIds, riepilogo.data, riepilogo.supermercato);
            azioniCell.appendChild(btnEliminaTutto);
        });
    }

    // FUNZIONE DI CARICAMENTO DETTAGLI (ORA PIÙ ROBUSTA)
    function caricaRiepilogoPerModifica(data, supermercatoNome) {
        // Controlli essenziali per evitare crash (la causa più probabile del problema)
        if (!spesaForm || !messaggioSpesaGestione || !articoliContainer || !supermercatoInput || !dataAcquistoInput || !submitSpesaBtn) {
            console.error("ERRORE CRITICO: Elementi HTML del modulo non trovati. Controlla gli ID!");
            if (messaggioSpesaGestione) {
                messaggioSpesaGestione.textContent = "❌ Errore nel caricamento del modulo. Controlla la console F12 per i dettagli.";
                messaggioSpesaGestione.style.color = 'red';
            }
            return;
        }

        const riepiloghi = getSpesePerGiornoESupermercato();
        const riepilogo = riepiloghi.find(r => r.data === data && r.supermercato === supermercatoNome);
        
        if (!riepilogo) return;

        // 1. Prepara il form 
        spesaForm.reset(); 
        spesaIdModificaInput.value = ''; 
        submitSpesaBtn.textContent = '💾 Registra Nuova Spesa Combinata'; 
        dataAcquistoInput.value = riepilogo.data;
        supermercatoInput.value = riepilogo.supermercato;

        // 2. Popola l'area messaggi e il container articoli
        messaggioSpesaGestione.textContent = `Visualizzazione ${riepilogo.dettagliArticoli.length} articoli acquistati da ${supermercatoNome} il ${riepilogo.data}. Puoi modificare i valori e registrarli come NUOVA spesa.`;
        messaggioSpesaGestione.style.color = 'blue';

        articoliContainer.innerHTML = ''; // Svuota il contenitore
        
        // Mappa tutti gli articoli del riepilogo nel container
        riepilogo.dettagliArticoli.forEach(dettaglio => {
            addItemRow(dettaglio);
        });

        updateTotals();
    }

    // FUNZIONE DI ELIMINAZIONE DI GRUPPO
    async function eliminaRiepilogoGiornoESupermercato(idsDaEliminare, data, supermercatoNome) {
        if (!messaggioSpesaGestione) return;

        const scontriniText = idsDaEliminare.length === 1 ? 'lo scontrino' : `${idsDaEliminare.length} scontrini`;
        
        if (confirm(`Sei sicuro di voler eliminare ${scontriniText} di ${supermercatoNome} del ${data}? Questa azione è permanente e verrà salvata online.`)) {
            
            GLOBAL_SPESE = GLOBAL_SPESE.filter(s => !idsDaEliminare.includes(s.id)); 
            
            if (await saveAllDataToBin()) {
                renderSpeseTable();
                updateSupermercatiDatalist();
                
                messaggioSpesaGestione.textContent = `✅ Il gruppo di spese di ${supermercatoNome} del ${data} è stato eliminato e il Bin è stato aggiornato!`;
                messaggioSpesaGestione.style.color = 'red';
            } else {
                 messaggioSpesaGestione.textContent = '❌ Errore di salvataggio remoto!';
                 messaggioSpesaGestione.style.color = 'red';
            }
        }
    }

    // Listener Aggiungi da Catalogo
    if (aggiungiDaCatalogoBtn) {
        aggiungiDaCatalogoBtn.addEventListener('click', () => {
            const idSelezionato = selettoreCatalogo.value;
            if (!idSelezionato) return;
            
            const prodotto = GLOBAL_CATALOGO.find(p => String(p.id) === idSelezionato);
            
            if (prodotto) {
                addItemRow(); 
                supermercatoInput.value = prodotto.supermercatoRiferimento;
                
                const righe = articoliContainer.querySelectorAll('.item-row');
                const ultimaRiga = righe[righe.length - 1];
                
                ultimaRiga.querySelector('.nomeAlimento').value = prodotto.nome;
                ultimaRiga.querySelector('.prezzoUnitario').value = prodotto.prezzoBase.toFixed(2);
                ultimaRiga.querySelector('.quantita').value = 1; 
                
                updateTotals(); 
            }
        });
    }

    // Listener Aggiungi Articolo Manuale
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => addItemRow());
    }
    
    // Listener Registrazione/Modifica Spesa 
    if (spesaForm) {
        spesaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const isModifica = spesaIdModificaInput.value !== '';
            
            const nuovaSpesa = {
                id: isModifica ? parseInt(spesaIdModificaInput.value) : Date.now(), 
                data: dataAcquistoInput.value,
                supermercato: supermercatoInput.value,
                articoli: []
            };

            let totaleSpesa = 0;
            const righeArticolo = articoliContainer.querySelectorAll('.item-row');
            
            righeArticolo.forEach(row => {
                const costoTotale = parseFloat(row.querySelector('.costoRiga').value);
                
                nuovaSpesa.articoli.push({
                    nome: row.querySelector('.nomeAlimento').value,
                    quantita: parseFloat(row.querySelector('.quantita').value),
                    prezzoUnitario: parseFloat(row.querySelector('.prezzoUnitario').value),
                    sconto: parseFloat(row.querySelector('.scontoPercentuale').value),
                    costoTotale: costoTotale
                });
                totaleSpesa += costoTotale;
            });
            
            nuovaSpesa.totaleSpesa = totaleSpesa;
            
            if (isModifica) {
                const index = GLOBAL_SPESE.findIndex(s => s.id === nuovaSpesa.id);
                if (index !== -1) {
                    GLOBAL_SPESE[index] = nuovaSpesa;
                    messaggioStato.textContent = `🔄 Spesa modificata di ${totaleSpesa.toFixed(2)} €... Salvataggio online in corso.`;
                }
            } else {
                GLOBAL_SPESE.push(nuovaSpesa);
                messaggioStato.textContent = `➕ Spesa di ${totaleSpesa.toFixed(2)} € registrata... Salvataggio online in corso.`;
            }

            // ----------------- SALVATAGGIO REMOTO -----------------
            if (await saveAllDataToBin()) {
                messaggioStato.textContent = isModifica 
                    ? `✅ Spesa modificata di ${totaleSpesa.toFixed(2)} € salvata con successo!` 
                    : `✅ Spesa registrata di ${totaleSpesa.toFixed(2)} € salvata con successo!`;
                messaggioStato.style.color = 'green';
                
                renderSpeseTable(); 
                updateSupermercatiDatalist();
                
                // Reset Modulo
                spesaForm.reset();
                spesaIdModificaInput.value = '';
                submitSpesaBtn.textContent = '💾 Registra Spesa Totale';
                messaggioSpesaGestione.textContent = 'Seleziona un gruppo di spese per visualizzare/modificare i dettagli.';
                messaggioSpesaGestione.style.color = 'black';
                articoliContainer.innerHTML = '';
                addItemRow();
                updateTotals();
                
            } else {
                messaggioStato.textContent = '❌ Errore nel salvataggio remoto. Riprova.';
                messaggioStato.style.color = 'red';
            }
        });
    }

    // Listener Budget
    if (budgetForm) {
        budgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const mese = document.getElementById('budgetMese').value.padStart(2, '0');
            const anno = document.getElementById('budgetAnno').value;
            const limite = parseFloat(document.getElementById('limiteBudget').value);
            
            const chiave = `${anno}-${mese}`;
            
            GLOBAL_BUDGET[chiave] = limite;
            
            messaggioBudget.textContent = `Aggiornamento budget in corso...`;
            
            if (await saveAllDataToBin()) {
                messaggioBudget.textContent = `✅ Budget di ${limite.toFixed(2)} € impostato per ${mese}/${anno} e salvato online.`;
                messaggioBudget.style.color = 'green';
            } else {
                messaggioBudget.textContent = '❌ Errore nel salvataggio remoto.';
                messaggioBudget.style.color = 'red';
            }
        });
    }
    
    // Listener Report
    if (ottieniReportBtn) {
        ottieniReportBtn.addEventListener('click', () => {
            const spese = GLOBAL_SPESE;
            const budget = GLOBAL_BUDGET;
            
            const mese = meseReportInput.value.padStart(2, '0');
            const anno = annoReportInput.value;
            const chiaveBudget = `${anno}-${mese}`;

            let totaleMese = 0;
            const speseDelMese = spese.filter(spesa => {
                const [spesaAnno, spesaMese] = spesa.data.split('-');
                return spesaMese === mese && spesaAnno === anno;
            });

            speseDelMese.forEach(spesa => {
                totaleMese += spesa.totaleSpesa;
            });
            
            const limiteBudget = budget[chiaveBudget] || 0.00;
            const differenza = limiteBudget - totaleMese;

            let stato = 'Nessun Budget Impostato';
            let coloreStato = 'gray';

            if (limiteBudget > 0) {
                stato = (differenza < 0) ? 'SFORATO' : 'Rispettato';
                coloreStato = (differenza < 0) ? 'red' : 'green';
            } else if (totaleMese > 0) {
                stato = 'Spese Registrate (Budget Assente)';
            } else {
                stato = 'Nessuna Spesa Registrata';
            }
            
            risultatoReport.innerHTML = `
                <h4>Report Mensile ${mese}/${anno}</h4>
                <p>Spesa Totale: <strong>${totaleMese.toFixed(2)} €</strong></p>
                <p>Budget Impostato: <strong>${limiteBudget.toFixed(2)} €</strong></p>
                <p>Differenza: <strong style="color: ${coloreStato};">${differenza.toFixed(2)} €</strong> (${stato})</p>
                
                ${speseDelMese.length > 0 ? 
                    `<h4>Dettaglio Acquisti Registrati:</h4>
                    <table id="reportDettaglioTable">
                        <thead><tr><th>Data</th><th>Supermercato</th><th>Totale Acquisto</th><th>Articoli (count)</th></tr></thead>
                        <tbody>
                            ${speseDelMese.map(spesa => `
                                <tr>
                                    <td>${spesa.data}</td>
                                    <td>${spesa.supermercato}</td>
                                    <td>${spesa.totaleSpesa.toFixed(2)} €</td>
                                    <td>${spesa.articoli.length}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>` : ''
                }
            `;
        });
    }
    
    // --- Funzioni Export/Import ---

    function exportData() {
        if (!messaggioSpesaGestione) return;
        const allData = {
            spese: GLOBAL_SPESE,
            catalogo: GLOBAL_CATALOGO,
            budget: GLOBAL_BUDGET
        };
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dataOdierna = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `backup_spese_catalogo_${dataOdierna}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        messaggioSpesaGestione.textContent = '✅ Backup completo esportato con successo!';
        messaggioSpesaGestione.style.color = 'green';
    }

    function importData(file) {
        if (!file || !messaggioSpesaGestione || !articoliContainer || !spesaForm) {
            messaggioSpesaGestione.textContent = '❌ Errore: Elementi DOM mancanti o nessun file selezionato.';
            messaggioSpesaGestione.style.color = 'red';
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const importedData = JSON.parse(event.target.result);

                if (importedData.spese && importedData.catalogo && importedData.budget) {
                    if (confirm('ATTENZIONE: Stai per sovrascrivere i dati online. Sei sicuro di voler importare?')) {
                        GLOBAL_SPESE = importedData.spese;
                        GLOBAL_CATALOGO = importedData.catalogo;
                        GLOBAL_BUDGET = importedData.budget;
                        
                        messaggioSpesaGestione.textContent = 'Caricamento dati in corso...';
                        
                        if (await saveAllDataToBin()) {
                            updateSupermercatiDatalist();
                            updateCatalogoDropdown();
                            renderSpeseTable();
                            
                            spesaForm.reset();
                            articoliContainer.innerHTML = '';
                            addItemRow();
                            updateTotals();

                            messaggioSpesaGestione.textContent = '🎉 Dati importati e salvati online con successo!';
                            messaggioSpesaGestione.style.color = 'blue';
                        } else {
                            messaggioSpesaGestione.textContent = '❌ Importazione fallita: Errore nel salvataggio remoto.';
                            messaggioSpesaGestione.style.color = 'red';
                        }
                    }
                } else {
                    messaggioSpesaGestione.textContent = '❌ Formato file .json non riconosciuto.';
                    messaggioSpesaGestione.style.color = 'red';
                }
            } catch (e) {
                messaggioSpesaGestione.textContent = '❌ Errore nella lettura del file: non è un JSON valido.';
                messaggioSpesaGestione.style.color = 'red';
            }
        };
        reader.readAsText(file);
    }

    // Listener Export
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    // Listener Import
    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener('click', () => { importFileInput.click(); });
        importFileInput.addEventListener('change', (e) => { importData(e.target.files[0]); });
    }
    
    // ----------------- Avvio Pagina -----------------
    updateCatalogoDropdown();
    addItemRow();
    renderSpeseTable();

    document.addEventListener('visibilitychange', async () => {
         if (document.visibilityState === 'visible') {
            await fetchInitialData(); 
            updateCatalogoDropdown();
            updateSupermercatiDatalist();
            renderSpeseTable();
         }
    });
}
// -----------------------------------------------------------
// LOGICA SPECIFICA PER catalogo.html
// -----------------------------------------------------------
function initializeCatalogoPage() {
    
    const prodottoForm = document.getElementById('prodottoForm');
    const nomeProdottoInput = document.getElementById('nomeProdotto');
    const prezzoBaseInput = document.getElementById('prezzoBase');
    const categoriaProdottoSelect = document.getElementById('categoriaProdotto');
    const supermercatoCatalogoInput = document.getElementById('supermercatoCatalogo');
    const prodottoIdModificaInput = document.getElementById('prodottoIdModifica');
    const submitProdottoBtn = document.getElementById('submitProdottoBtn');
    const messaggioProdotto = document.getElementById('messaggioProdotto');
    const catalogoBody = document.getElementById('catalogoBody');
    
    // Popola la Select Categorie
    if (categoriaProdottoSelect) {
        CATEGORIE.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            categoriaProdottoSelect.appendChild(option);
        });
    }

    // Genera la tabella del catalogo
    function renderCatalogoTable() {
        if (!catalogoBody) return;
        catalogoBody.innerHTML = '';

        GLOBAL_CATALOGO.forEach(prodotto => {
            const row = catalogoBody.insertRow();
            row.insertCell().textContent = prodotto.nome;
            row.insertCell().textContent = prodotto.categoria;
            row.insertCell().textContent = prodotto.prezzoBase.toFixed(2) + ' €';
            row.insertCell().textContent = prodotto.supermercatoRiferimento;
            
            const azioniCell = row.insertCell();
            
            const btnModifica = document.createElement('button');
            btnModifica.textContent = '✏️ Modifica';
            btnModifica.className = 'btn-modifica';
            btnModifica.onclick = () => caricaProdottoPerModifica(prodotto.id);
            azioniCell.appendChild(btnModifica);

            const btnElimina = document.createElement('button');
            btnElimina.textContent = '🗑️ Elimina';
            btnElimina.className = 'btn-elimina';
            btnElimina.onclick = () => eliminaProdotto(prodotto.id);
            azioniCell.appendChild(btnElimina);
        });

        updateSupermercatiDatalist();
    }

    // Carica dati nel form per la modifica
    function caricaProdottoPerModifica(id) {
        if (!nomeProdottoInput || !prezzoBaseInput || !categoriaProdottoSelect || !supermercatoCatalogoInput || !prodottoIdModificaInput || !submitProdottoBtn) return;
        
        const prodotto = GLOBAL_CATALOGO.find(p => p.id === id);

        if (prodotto) {
            prodottoIdModificaInput.value = prodotto.id;
            nomeProdottoInput.value = prodotto.nome;
            prezzoBaseInput.value = prodotto.prezzoBase;
            categoriaProdottoSelect.value = prodotto.categoria;
            supermercatoCatalogoInput.value = prodotto.supermercatoRiferimento;
            submitProdottoBtn.textContent = '💾 Salva Modifiche Prodotto';
            messaggioProdotto.textContent = `Modifica prodotto: ${prodotto.nome}.`;
            messaggioProdotto.style.color = 'orange';
        }
    }

    // Elimina prodotto
    async function eliminaProdotto(id) {
        if (!messaggioProdotto) return;

        if (confirm('Sei sicuro di voler eliminare questo prodotto dal catalogo? Questa azione sarà salvata online.')) {
            GLOBAL_CATALOGO = GLOBAL_CATALOGO.filter(p => p.id !== id);
            
            if (await saveAllDataToBin()) {
                renderCatalogoTable();
                messaggioProdotto.textContent = 'Prodotto eliminato e salvato online!';
                messaggioProdotto.style.color = 'green';
            } else {
                 messaggioProdotto.textContent = '❌ Errore di salvataggio remoto!';
                 messaggioProdotto.style.color = 'red';
            }
        }
    }
    
    // Listener Aggiungi/Modifica Prodotto
    if (prodottoForm) {
        prodottoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!messaggioProdotto) return;

            const id = prodottoIdModificaInput.value ? parseInt(prodottoIdModificaInput.value) : null;
            const nome = nomeProdottoInput.value.trim();
            const prezzo = parseFloat(prezzoBaseInput.value);
            const categoria = categoriaProdottoSelect.value;
            const supermercatoRif = supermercatoCatalogoInput.value.trim(); 

            if (!nome || !prezzo || !categoria || !supermercatoRif) {
                messaggioProdotto.textContent = '❌ Tutti i campi sono obbligatori.';
                messaggioProdotto.style.color = 'red';
                return;
            }

            const nuovoProdotto = { 
                id: id || Date.now(),
                nome: nome,
                prezzoBase: prezzo,
                categoria: categoria,
                supermercatoRiferimento: supermercatoRif
            };

            let isNew = false;
            if (id) {
                // Modifica
                const index = GLOBAL_CATALOGO.findIndex(p => p.id === id);
                if (index !== -1) {
                    GLOBAL_CATALOGO[index] = nuovoProdotto;
                }
            } else {
                // Aggiungi
                GLOBAL_CATALOGO.push(nuovoProdotto);
                isNew = true;
            }
            
            messaggioProdotto.textContent = `Salvataggio online in corso...`;

            // ----------------- SALVATAGGIO REMOTO -----------------
            if (await saveAllDataToBin()) {
                
                messaggioProdotto.textContent = isNew 
                    ? `✅ Prodotto "${nome}" aggiunto e salvato online!`
                    : `✅ Prodotto "${nome}" modificato e salvato online!`;
                messaggioProdotto.style.color = 'green';
                
                prodottoForm.reset();
                submitProdottoBtn.textContent = '💾 Aggiungi Nuovo Prodotto';
                prodottoIdModificaInput.value = '';
                renderCatalogoTable();
            } else {
                messaggioProdotto.textContent = '❌ Errore nel salvataggio remoto!';
                messaggioProdotto.style.color = 'red';
            }
        });
    }

    // Avvio Pagina Catalogo
    renderCatalogoTable();

    // Listener per aggiornare i dati se la pagina torna in primo piano (es. cambio tab)
    document.addEventListener('visibilitychange', async () => {
         if (document.visibilityState === 'visible') {
            await fetchInitialData(); // Ricarica tutti i dati dal bin
            renderCatalogoTable();
         }
    });
}
