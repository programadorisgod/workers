onmessage = function (event) {

    for (let i = 0; i < 1000000; i++) {

        if (i === 99999) {
            postMessage({
                type: "message, i == 99999",
                data: "test web workers",
            });
        }

        if (i === 999999) {
            postMessage({
                type: "message, i == 999999",
                data: "test web workers",
            });
        }
    }

    postMessage({
        type: "done",
        data: "done",
    });
};
