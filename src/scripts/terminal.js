document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const output = document.getElementById('output');
    const promptLine = document.getElementById('prompt-line');
    let inputBuffer = '';
    let inputEnabled = false;

    let chapter1LogText = "";
    let chapter2LogText = "";
    let chapter3LogText = "";    
    let chapter4LogText = "";
    let chapter5LogText = "";    
    let chapter6LogText = "";

    let chapter7LogText = "";
    const chapter7LogTextHash = "e4429442dd0a259e2ebc047bc7e588e65f5c640e0ddac110a7b54764fa67bb16";

    let secretLogText = "";
    const chapter8LogTextHash = "e5761ca80822da2253030046f4aa4d9faf1427a279d60fbd15244f480989808d";

    function setInputEnabled(enabled) {
        inputEnabled = enabled;
        promptLine.style.display = enabled ? 'flex' : 'none';
        if (enabled) userInput.focus();
        document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
    }

    const bg = document.getElementById('troy');

    function setBackgroundOpacity(targetOpacity, duration = 500) {
        const startOpacity = parseFloat(getComputedStyle(bg).opacity);
        const startTime = performance.now();

        function animate(time) {
            const elapsed = time - startTime;
            let progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
            bg.style.opacity = currentOpacity;

            if (progress < 1) {
            requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    function encode(text, keyword) {
    const start = 32;
    const range = 95;
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < start || code > 126) {
            result += text[i];
            continue;
        }
        const keyCode = keyword.charCodeAt(i % keyword.length);
        const shifted = ((code - start) + (keyCode - start)) % range;
        result += String.fromCharCode(shifted + start);
    }
    return result;
}

function decode(text, keyword) {
    const start = 32;
    const range = 95;
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < start || code > 126) {
            // Skip decoding non-ASCII printable characters
            result += text[i];
            continue;
        }
        const keyCode = keyword.charCodeAt(i % keyword.length);
        let shifted = (code - start) - (keyCode - start);
        if (shifted < 0) shifted += range;
        result += String.fromCharCode(shifted + start);
    }
    return result;
}

    async function hashString(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
         // Convert bytes to hex string
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function typeMessage(message, callback, speedMin = 15, speedMax = 35, ellipsisDuration = 2000, color = '#FFFFFF') {
        setInputEnabled(false);
        const line = document.createElement('div');
        output.appendChild(line);
        line.style.color = color;

        const specialChar = '§';
        let ellipsisInterval = null;
        let ellipsisCount = 0;
        let index = 0;
        const ellipsisPos = message.indexOf(specialChar);

        function updateEllipsis() {
            ellipsisCount = (ellipsisCount + 1) % 4; // Cycles 0,1,2,3
            line.innerHTML = message.slice(0, ellipsisPos) + '.'.repeat(ellipsisCount);
        }

        function typeNext() {
            if (index < message.length) {
                if (message[index] === specialChar) {
                    ellipsisInterval = setInterval(updateEllipsis, 400);
                    index++; // Skip the special character
                    setTimeout(typeNext, 0);
                    return;
                }
                if (index === ellipsisPos) {
                    return;
                }
                line.innerHTML = message.slice(0, index + 1);
                index++;
                document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
                const delay = speedMin + Math.random() * (speedMax - speedMin);
                setTimeout(typeNext, delay);
            } else {
                if (ellipsisInterval) {
                    setTimeout(() => {
                        clearInterval(ellipsisInterval);
                        line.innerHTML = message.replace(specialChar, '...');
                        if (callback) callback();
                    }, ellipsisDuration);
                } else {
                    if (callback) callback();
                }
            }
        }

        typeNext();
    }

    function setCookie(name, value, days = 365) {
        const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, val] = cookie.trim().split('=');
            if (key === name) return decodeURIComponent(val);
        }
        return null;
    }

    function deleteAllCookies() {
        document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    }
    
    function changeColor(color) {
        document.body.style.color = color;

        const terminal = document.querySelector('.terminal');
        if (terminal) terminal.style.borderColor = color;

        document.querySelectorAll('.prompt').forEach(el => {
          el.style.color = color;
        });

        document.querySelectorAll('.cursor').forEach(el => {
            el.style.color = color;
        });
    }

    let isInLogDecryption = false;
    let decryptingLog8 = false;
    let logsEnabled = false;
    let troyCommandEnabled = false;

    function handleCommand(command) {

        if (getCookie("seenStatus") === "true") logsEnabled = true;
        if (getCookie("troyCommandEnabled") === "true") troyCommandEnabled = true;

        userInput.textContent = '';
        inputBuffer = '';
        var split = command.split(' ');

        let commandLower = command.toLowerCase();
        let args = [];

        if (split.length > 0) {
            commandLower = split[0].toLowerCase();
            args = split.slice(1);
        }

        if (isInLogDecryption) {
            if (decryptingLog8)
            {
                typeMessage("Decryption Key is suitable, but may not be correct. Attempting to decrypt log§", () => {
                    const decoding = decode(secretLogText, commandLower);
                    console.log(decoding);
                    hashString(decoding).then(hash => {
                        console.log(hash);

                        if (hash == chapter8LogTextHash) {
                            isInLogDecryption = false;
                            typeMessage("Successfully Decrypted Log!\n" + decoding, () => {
                                setTimeout(() => {
                                    clearOutput();
                                    setTimeout(() => {
                                        typeMessage("Connection to Access Terminal lost. Your access has been revoked.");
                                        setCookie("thosewhoknow", "true");
                                    }, 3000)
                                }, 15000)
                            }, 5, 10);
                        }
                        else {
                            typeMessage("Decryption Key is incorrect. Please try again later.", () => {
                                isInLogDecryption = false;
                                setInputEnabled(true);
                            }, 5, 10);
                        }
                    })
                }, 5, 10)
            }
            else {
            typeMessage("Decryption Key is suitable, but may not be correct. Attempting to decrypt log§", () => {
                const decoded = decode(chapter7LogText, commandLower);
                hashString(decoded).then(hash => {
                console.log(hash);
                console.log(decoded);

                if (hash == chapter7LogTextHash) {
                    typeMessage("Successfully Decrypted Log!\n" + decoded, () => {
                    if (getCookie("seenLog7") === "true") {
                        setInputEnabled(true);
                        isInLogDecryption = false;
                        return;
                    }
                    setTimeout(() => {
                    isInLogDecryption = false;
                    if (getCookie("seenLog7") !== "true") {
                        typeMessage("Message recieved by unknown sender. Patching through message§", () => { 
                            clearOutput();
                            typeMessage("I see you've gained access to an access terminal. They were all supposed to have been destr<strong>o</strong>yed, but I guess one slipped through the cracks.",
                                () => {
                                    setTimeout(() => {
                                        typeMessage("I am the last survivor of the Nova Agen<strong>c</strong>y. I hop<strong>e</strong> you understand the e<strong>x</strong>treme gravity of the situation.",
                                            () => {
                                                setTimeout(() => {
                                                    typeMessage("The virus has spread beyond our control. There <strong>i</strong>s nothing el<strong>s</strong>e we can do.",
                                                        () => {
                                                            setTimeout(() => {
                                                                typeMessage("I have transferred you one last log from my internal filesyste<strong>m</strong>.", () => {
                                                                    setTimeout(() => {
                                                                        setCookie("seenLog7", "true");
                                                                        typeMessage("Transmission finished. (1) new log(s) recieved.",
                                                                            () => {
                                                                                setTimeout(() => {
                                                                                    clearOutput();
                                                                                    setInputEnabled(true);
                                                                                }, 1000);
                                                                            },
                                                                            5, 10
                                                                );
                                                                    }, 2000)
                                                                }, 45, 50);
                                                            })
                                                        },
                                                        45, 50
                                                    )
                                                }, 2000)
                                            },
                                            45, 50
                                        )
                                    }, 2000)
                                },
                                45, 50
                            )

                        }, 5, 10, 4000);
                    }
                    else
                    {
                        setInputEnabled(true);
                    }
                }, 10000)
                    
                }, 5, 10);
                }
                else {
                    typeMessage("Decryption Key is incorrect. Please try again later.", () => {
                        isInLogDecryption = false;
                        setInputEnabled(true);
                    }, 5, 10);
                }
                });
            }, 5, 10, 5000);
        }
            return;
        }

        if (commandLower === 'help') {
            typeMessage("Available commands: help, clear, status, log" + (troyCommandEnabled ? ", troy" : "") + (getCookie("seenLog7") === "true" ? ", transmission" : ""), () => { setInputEnabled(true); }, 5, 10);
        }
        else if (commandLower === 'reset') {
            deleteAllCookies();
        }
        else if (commandLower === 'clear') {
            clearOutput();
        }
        else if (commandLower === 'transmission' && getCookie("seenLog7") === "true") {
            typeMessage("Message recieved by unknown sender. Patching through message§", () => { 
                            clearOutput();
                            typeMessage("I see you've gained access to an access terminal. They were all supposed to have been destr<strong>o</strong>yed, but I guess one slipped through the cracks.",
                                () => {
                                    setTimeout(() => {
                                        typeMessage("I am the last survivor of the Nova Agen<strong>c</strong>y. I hop<strong>e</strong> you understand the e<strong>x</strong>treme gravity of the situation.",
                                            () => {
                                                setTimeout(() => {
                                                    typeMessage("The virus has spread beyond our control. There <strong>i</strong>s nothing el<strong>s</strong>e we can do.",
                                                        () => {
                                                            setTimeout(() => {
                                                                typeMessage("I have transferred you one last log from my internal filesyste<strong>m</strong>.", () => {
                                                                    setTimeout(() => {
                                                                        setCookie("seenLog7", "true");
                                                                        typeMessage("Transmission finished. (1) new log(s) recieved.",
                                                                            () => {
                                                                                setTimeout(() => {
                                                                                    clearOutput();
                                                                                    setInputEnabled(true);
                                                                                }, 1000);
                                                                            },
                                                                            5, 10
                                                                );
                                                                    }, 2000)
                                                                }, 45, 50);
                                                            })
                                                        },
                                                        45, 50
                                                    )
                                                }, 2000)
                                            },
                                            45, 50
                                        )
                                    }, 2000)
                                },
                                45, 50
                            )

                        }, 5, 10, 4000);
        }
        else if (commandLower === 'status') {
            typeMessage("Nova Surveilence System Status: Offline", () => {
                setTimeout(() => {
                    typeMessage("Last Connection: 12/2/2024 14:32:45", () => { }, 5, 10);
                    typeMessage("Last Message: Massive quake detected, lack of Nova life signals warrants usage of emergency shutdown protocol. Shutting down.\nThe (7) most recent log(s) have been uploaded to the system.", () => { 
                        setInputEnabled(true); 
                        logsEnabled = true;
                        setCookie("seenStatus", "true");
                    }, 5, 10);
                }, 500);
            }, 5, 10);
        }
        else if (commandLower === 'log' || commandLower === 'logs') {

            if (!logsEnabled) {
                typeMessage("Error: Logs are currently unavailable. Please check system status.", () => { setInputEnabled(true); }, 5, 10);
                return;
            }

            if (args.length === 0) {
                typeMessage("Available logs: 1, 2, 3, 4, 5, 6, 7" + (getCookie("seenLog7") === "true" ? ", 8" : ""), () => { setInputEnabled(true); }, 5, 10);
            }

            if (args.length > 0) {
                const logNumber = parseInt(args[0]);
                switch (logNumber) {
                    case 1:
                        typeMessage(chapter1LogText, () => { setInputEnabled(true); }, 5, 10);
                        break;
                    case 2:
                        typeMessage(chapter2LogText, () => { setInputEnabled(true); }, 5, 10);
                        break;
                    case 3:
                        typeMessage(chapter3LogText, () => { setInputEnabled(true); }, 5, 10);
                        break;
                    case 4:
                        typeMessage(chapter4LogText, () => { setInputEnabled(true); }, 5, 10);
                        break;
                    case 5:
                        typeMessage(chapter5LogText, () => { setInputEnabled(true); }, 5, 10);
                        break;
                    case 6:
                        setBackgroundOpacity(0.05, 1000);
                        typeMessage(chapter6LogText, () => { 
                            setTimeout(() => {
                                setInputEnabled(true); 
                                setBackgroundOpacity(0, 1000);
                            }, 4000)
                        }, 25, 30, 0, '#DA012E');
                        setCookie("customName", "Intruder");
                        setCookie("troyCommandEnabled", "true");
                        troyCommandEnabled = true;
                        break;
                    case 7:
                        isInLogDecryption = true;
                        typeMessage("Log Encrypted: Please enter decryption key.", () => {
                            setInputEnabled(true);
                        }, 5, 10);
                        break;
                    case 8:
                        if (getCookie("seenLog7") !== "true") {
                            typeMessage("Invalid log number.", () => { setInputEnabled(true); }, 5, 10);
                            return;
                        }
                        isInLogDecryption = true;
                        decryptingLog8 = true;
                        typeMessage("Log Encrypted: Please enter decryption key.", () => {
                            setInputEnabled(true);
                        }, 5, 10);
                        break;
                    default:
                        typeMessage("Invalid log number.", () => { setInputEnabled(true); }, 5, 10);
                }
            }
        }
        else if (commandLower === 'troy' && troyCommandEnabled) {
            const messages = ["fuck you.", "take off your skin!", "did you know if you laid out all your blood vessels from end to end, you would be dead? facinating!", 
                "have you ever heard of the secret letter phenomenon? apparently, the letter d is pretty secret!", 
                "kill yourself!", "press Alt+F4 for the next secret!", "Did you know if you open file explorer, and delete the folder C:\\Windows\\System32, it'll give you a clue for the next secret?",
                "Ruina Mentis is the greatest insanity song. I love that black and red guy!",
            `                                                            
                                         ************     *#                            
                                   **@@@@%%@@@@@@@@@@@@* *@@*                           
                                 *@@@@@@%@@@*@@@@@@@@@@*@@@@@*                          
                               *@@@@@@@@*@@@@@*@@@@@*@@@@@@@@@*                         
                              *@@@@@@@@@*@@@@@*@*%@@@@@@@@@@@@@*                        
                        %    *@@@@@@@@@*@@@@@@@@@@@@@@@@@@@@@@@*                        
                        %%   %@@@@@@@@*@@@@@@@@@@@@@@@@@@@@@@@@%                        
                        %%%%%%@@@@@@@#@@@@@@@@@@@@@@@@@@@@@@@@*                         
                         @%@@%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@* *  *%*                    
                        @%%%%@%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#*                     
                        @%%%%%%%%%@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@                       
                        @%%%%%%%%%@@@@@@@@@@*@@@@@@%%%%@@@@@@@@@                        
                        @%%%%@*@@@@@@@@@@@@@@%@*%%%%%%%%@@@@@@%                         
                        @%%%%%@@@@@@@@@@@@@@%%%%%%%@@@@@@@@@*                           
                     @@@%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@**@*                          
               @@@@@@%%@%%%%%%#@*@@%@@@@@@@@@@@@@@@@@%@@@*@*                            
              @@%%%%%@@@@%%%%%@@@@@@@%@%@%@@@@@@%@%@@@@@*                               
              @@%%@@@%%%@%%%%%@@%%%@@**@%@@@@@@@@@@#@@*#*                               
              @@@@@%%%%%%%%%%%@@%%%%@%%%@#********@@#@@@@@@**                           
              @@@@%%%%%%%@%%%%%@%%%%%%%%%@@@@@@@@%@@@@@@@@@***                          
               @@@@%%%%%%%@%%%%@%%%%%@%%%@#@@@@@*@@@@@@@@*@*                            
                @@@@%%%%%@@%%%%@%%%%%@%%%%@@%**@*%%@@@@@@@@@@*                          
                @@@@%%%%%%%%%%%%@%%%%%@%%%@*@@@@%@@@@@@@@@@@@@@                         
                @@@@@%%%%%%%%%%%@@%%%%@%%@@*%@@@@%@@@@@@@@@@@@@@*                       
                 @@@@%%%%%%%%%%%@@%%%%@%%@@@%@@@@%@@@@@@@@@@@@@@@*                      
                  @@@@%%@@@@%%%%@@@@@@@@@@%@@@@%@%%@@@@@@@@@@@@@@@@*                    
                    @@@@@@@@@@@@@@@@@@@@@@@@@@@%@%%@@@@@@@@@@@@@@@@@@                   
                     @@@@@@@@@@@@@@                                                     
                       @@@@@@@@@                                                        `,
        ];

            const randomIndex = Math.floor(Math.random() * messages.length);
            const randomMessage = messages[randomIndex];

            let minSpeed = 25;
            let maxSpeed = 30;

            if (randomIndex === messages.length - 1) {
                minSpeed = 5;
                maxSpeed = 10;
            }

            setBackgroundOpacity(0.05, 300);
            typeMessage(randomMessage, () => { 
                setInputEnabled(true); 
                setBackgroundOpacity(0, 500);
            }, minSpeed, maxSpeed, 0, '#DA012E');
        }
        else {
            typeMessage(`Unknown command: ${commandLower}`, () => {
                setInputEnabled(true);
            }, 5, 10);
        }
    }

    function fetchStringFromBackend(url, callback) {
        // temp
        callback("101%");
    }

    function clearOutput() {
        output.innerHTML = '';
        inputBuffer = '';
        userInput.textContent = '';
    }

    function startMain() {
        const name = getCookie("customName") || "Guest";

        typeMessage(`Nova Access Terminal (Ver 7.3) - Welcome, ${name}!`, () => { }, 5, 10);
        typeMessage("Type 'help' to see available commands.", () => { }, 5, 10);
        setInputEnabled(true);
    }

    function hexToString(hexString) {
  let result = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexPair = hexString.substring(i, i + 2);
    const decimalValue = parseInt(hexPair, 16);
    result += String.fromCharCode(decimalValue);
  }
  return result;
}

    fetch('scripts/logs/chapter1.txt')
    .then(res => res.text())
    .then(text => {
        chapter1LogText = text;
    })

    fetch('scripts/logs/chapter2.txt')
    .then(res => res.text())
    .then(text => {
        chapter2LogText = text;
    })

    fetch('scripts/logs/chapter3.txt')
    .then(res => res.text())
    .then(text => {
        chapter3LogText = text;
    })
    
    fetch('scripts/logs/chapter4.txt')
    .then(res => res.text())
    .then(text => {
        chapter4LogText = text;
    })

    fetch('scripts/logs/chapter5.txt')
    .then(res => res.text())
    .then(text => {
        chapter5LogText = text;
    })

    fetch('scripts/logs/chapter6.txt')
    .then(res => res.text())
    .then(text => {
        chapter6LogText = text.split('⠀')[0];
    })

fetch('scripts/logs/chapter7.txt')
  .then(res => res.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('utf-8');
    chapter7LogText = decoder.decode(buffer);
  });

fetch('scripts/logs/chapter8.txt')
  .then(res => res.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('utf-8');
    secretLogText = decoder.decode(buffer);
  });

    if (getCookie("thosewhoknow") === "true") {
        typeMessage("Connection to Access Terminal lost. Your access has been revoked.");
        return;
    }
    if (getCookie("seenIntro2") === "true") {
        startMain();
    } else {
        typeMessage("Attempting to boot Nova Access Terminal (Ver 7.3)§", () => {
            typeMessage("Failed to connect to Nova Access Server.", () => setTimeout(() => {
                typeMessage("Attempting to connect to backup access server§", () => {
                    typeMessage("Failed to connect to backup access server.", () => setTimeout(() => {
                        typeMessage("Searching for inactive access servers to check connection status§", () => {
                            fetchStringFromBackend("http://localhost:3000/server-status", (serverStatus) => {
                                typeMessage("Found (1) inactive access server(s). Determining connection status§", () => {
                                    typeMessage("Connection Status: Active", () => setTimeout(() => {
                                        typeMessage(`Connecting§`, () => {
                                            clearOutput();
                                            startMain();
                                        }, 5, 10, 4000);
                                        setCookie("seenIntro2", "true");
                                    }, 500), 5, 10);
                                }, 5, 10, 3000);
                            });
                        }, 5, 10, 7000);
                    }, 2000), 5, 10);
                }, 5, 10, 5000);
            }, 1000), 5, 10);
        }, 5, 10, 5000);
    }

    window.addEventListener('keydown', (e) => {
        if (!inputEnabled) return;

        if (
            e.ctrlKey ||
            e.altKey ||
            e.metaKey ||
            (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter')
        ) {
            return;
        }

        if (e.key === 'Backspace') {
            inputBuffer = inputBuffer.slice(0, -1);
            document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
        } else if (e.key === 'Enter') {
            const commandLine = document.createElement('div');
            commandLine.textContent = '> ' + inputBuffer;
            output.appendChild(commandLine);
            document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
            handleCommand(inputBuffer);
            inputBuffer = '';
        } else if (e.key.length === 1) {
            inputBuffer += e.key;
            document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
        }

        userInput.textContent = inputBuffer;
    });
});
