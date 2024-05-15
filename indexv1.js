const puppeteer = require('puppeteer');
const fs = require('fs');

function espera(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function automacaoWhatsApp() {
    const browser = await puppeteer.launch({ headless: false,  userDataDir: './user_data'});

    try {
        let c = 0;



        const page = await browser.newPage();
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle0', timeout: 120000 });
        await page.waitForSelector('#pane-side', { timeout: 120000 });


        await espera(30000);
        console.log("Página carregada!");
        
        

        let conversaSelector;
        let seletorNaoLidas;
        let j = 1;
        while (c < 30) {
            
            if (c % 2 == 0) {
                j = 3;

            }
            else {
                j = 1;
            }

            for (let i = 1; i < 100; i++) {

                conversaSelector = `#pane-side > div:nth-child(${j}) > div > div > div:nth-child(${i})`;
                // Verificar se a conversa existe na lista
                const conversa = await page.$(conversaSelector);

                if (!conversa) {



                }
                else {

                    seletorNaoLidas = `#pane-side > div:nth-child(${j}) > div > div > div:nth-child(${i}) > div > div > div > div._ak8l > div._ak8j > div._ak8i > span`;

                    const mensagensNaoLidasElement = await page.$(seletorNaoLidas);

                    if (mensagensNaoLidasElement) {
                        console.log(i + "Achou conversa nao lida nessa iteração");
                        const mensagensNaoLidasTexto = await page.evaluate(el => el.textContent.trim(), mensagensNaoLidasElement);
                        const mensagensNaoLidas = parseInt(mensagensNaoLidasTexto);

                        // Obter o horário da última mensagem na conversa
                        const seletorHorario = `#pane-side > div:nth-child(${j}) > div > div > div:nth-child(${i}) > div > div > div > div._ak8l > div._ak8o > div._ak8i`;

                        const horarioTexto = await page.$eval(seletorHorario, span => span.textContent.trim());

                        // Verificar se o horário está no formato de hora (HH:MM) e calcular diferença em minutos
                        if (horarioTexto.includes(':')) {
                            const [hora, minuto] = horarioTexto.split(':').map(Number);
                            const horaAtual = new Date().getHours();
                            const minutoAtual = new Date().getMinutes();
                            const diferencaMinutos = (horaAtual - hora) * 60 + (minutoAtual - minuto);
                            const nomeContato = await conversa.$eval('span[title]', span => span.getAttribute('title'));


                            // Verificar se a diferença de tempo é 5 minutos ou menos e há mensagens não lidas
                            if (diferencaMinutos <= 800 && mensagensNaoLidas > 0) {
                                // Obter o nome do contato

                                console.log(`Clicando em ${nomeContato} - Mensagens não lidas: ${mensagensNaoLidas}, Horário: ${horarioTexto}`);

                                // Clicar no contato (substitua essa ação pela interação desejada)
                                await conversa.click(); // Simulação de clique no contato

                                await espera(2000);

                                let ultimaMSG;
                                for (let i = 1; ; i++) {
                                    const mensagens = await page.$(`#main > div._amm9 > div > div._ajyl > div.x3psx0u.xwib8y2.xkhd6sd.xrmvbpv > div:nth-child(${i}) > div > div > div._amk4._amkd > div._amk6._amlo > div:nth-child(2) > div > div.copyable-text > div > span._ao3e.selectable-text.copyable-text > span`);



                                    if (mensagens) {

                                        const ultimaMSGString = await page.$eval(`#main > div._amm9 > div > div._ajyl > div.x3psx0u.xwib8y2.xkhd6sd.xrmvbpv > div:nth-child(${i}) > div > div > div._amk4._amkd > div._amk6._amlo > div:nth-child(2) > div > div.copyable-text > div > span._ao3e.selectable-text.copyable-text > span`, span => span.textContent.trim());

                                        ultimaMSG = ultimaMSGString;
                                    }
                                    if (i > 30) {
                                        console.log("Ultima mensagem enviada: " + ultimaMSG + " \nRemetente: " + nomeContato + "\nHorário: " + horarioTexto + "\nMensagens nao lidas: " + mensagensNaoLidas)
                                        await page.waitForSelector('div._ak1l');
                                        const inputElement = await page.$('div._ak1l [contenteditable=true]');
                                        //Add a get from API (localhost:8000/{ultimaMSG}/{NomeContato})



                                        if (inputElement && ultimaMSG.includes('ping')) {

                                            await inputElement.type('pong');
                                            console.log('Texto inserido com sucesso!');
                                            const sendButton = await page.waitForSelector('button[data-tab="11"][aria-label="Enviar"]');
                                            await sendButton.click();
                                            console.log('Botão de envio clicado com sucesso!');
                                            await page.keyboard.press('Escape');
                                            
                                        }
                                        else {
                                            console.log('Botão de envio nao encontrado');
                                        }
                                        break;
                                    }

                                }

                            }
                        }
                    }
                }
            }
            c++;
            console.log("Terminando um ciclo")
            await espera(2000);


        }

    } catch (error) {
        console.error('Erro durante a automação:', error);
    } finally {
        await browser.close();
    }
}

automacaoWhatsApp();
