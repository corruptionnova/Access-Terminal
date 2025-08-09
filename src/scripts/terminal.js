document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const output = document.getElementById('output');
    const promptLine = document.getElementById('prompt-line');
    let inputBuffer = '';
    let inputEnabled = false;

    function setInputEnabled(enabled) {
        inputEnabled = enabled;
        promptLine.style.display = enabled ? 'flex' : 'none';
        if (enabled) userInput.focus();
    }

    function typeMessage(message, callback, speedMin = 15, speedMax = 35, ellipsisDuration = 2000) {
        setInputEnabled(false);
        const line = document.createElement('div');
        output.appendChild(line);

        const specialChar = '§';
        let ellipsisInterval = null;
        let ellipsisCount = 0;
        let index = 0;
        const ellipsisPos = message.indexOf(specialChar);

        function updateEllipsis() {
            ellipsisCount = (ellipsisCount + 1) % 4; // Cycles 0,1,2,3
            line.textContent = message.slice(0, ellipsisPos) + '.'.repeat(ellipsisCount);
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
                line.textContent = message.slice(0, index + 1);
                index++;
                const delay = speedMin + Math.random() * (speedMax - speedMin);
                setTimeout(typeNext, delay);
            } else {
                if (ellipsisInterval) {
                    setTimeout(() => {
                        clearInterval(ellipsisInterval);
                        line.textContent = message.replace(specialChar, '...');
                        if (callback) callback();
                    }, ellipsisDuration);
                } else {
                    if (callback) callback();
                }
            }
        }

        typeNext();
    }

    function handleCommand(command) {
        const response = `You entered: ${command}`;
        typeMessage(response, () => setInputEnabled(true), 5, 10);
    }

    function fetchStringFromBackend(url, callback) {
        //temp
        return "10%";
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

    if (getCookie("seenIntro") === "true") {
        fetchStringFromBackend("http://localhost:3000/server-status", (serverStatus) => {
            typeMessage(
                "Using previous found inactive access server. Determining connection status§",
                () => {
                    typeMessage(
                        "Connection status: Inactive",
                        () => setTimeout(() => {
                            typeMessage(`Connection Progress: ${serverStatus}.`,
                                () => setTimeout(() => {
                                    typeMessage("Awaiting further input§",
                                        () => {},
                                        5, 10, Number.MAX_VALUE
                                    )
                                }),
                            5, 10
                            );
                        }, 500),
                        5, 10
                    );
                },
                5, 10,
                3000
            );
        });
    } else {
        // Boot message
        typeMessage(
            "Attempting to boot Nova Access Terminal (Ver 7.3)§",
            () => {
                typeMessage(
                    "Failed to connect to Nova Access Server.",
                    () => setTimeout(() => {
                        typeMessage(
                            "Attempting to connect to backup access server§",
                            () => {
                                typeMessage(
                                    "Failed to connect to backup access server.",
                                    () => setTimeout(() => {
                                        typeMessage(
                                            "Searching for inactive access servers to check connection status§",
                                            () => {
                                                fetchStringFromBackend("http://localhost:3000/server-status", (serverStatus) => {
                                                    typeMessage(
                                                        "Found (1) inactive access server(s). Determining connection status§",
                                                        () => {
                                                            typeMessage(
                                                                "Connection status: Inactive",
                                                                () => setTimeout(() => {
                                                                    typeMessage(`Connection Progress: ${serverStatus}.`,
                                                                        () => setTimeout(() => {
                                                                            typeMessage("Awaiting further input§",
                                                                                () => {},
                                                                                5, 10, Number.MAX_VALUE
                                                                            )
                                                                        }),
                                                                        5, 10
                                                                    );
                                                                    setCookie("seenIntro", "true");
                                                                }, 500),
                                                                5, 10
                                                            );
                                                        },
                                                        5, 10,
                                                        3000
                                                    );
                                                });
                                            },
                                            5, 10,
                                            7000
                                        );
                                    }, 2000),
                                    5, 10
                                );
                            },
                            5, 10,
                            5000
                        );
                    }, 1000),
                    5, 10
                );
            },
            5, 10,
            5000
        );
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
        } else if (e.key === 'Enter') {
            const commandLine = document.createElement('div');
            commandLine.textContent = '> ' + inputBuffer;
            output.appendChild(commandLine);

            handleCommand(inputBuffer);
            inputBuffer = '';
        } else if (e.key.length === 1) {
            inputBuffer += e.key;
        }

        userInput.textContent = inputBuffer;
    });
});
