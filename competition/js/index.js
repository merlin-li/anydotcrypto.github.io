var web3 = Web3
  ? new Web3(
      Web3.givenProvider ||
        new Web3.providers.WebsocketProvider(
          "wss://mainnet.infura.io/ws/v3/7333c8bcd07b4a179b0b0a958778762b"
        )
    )
  : null;

// Check it is mainnet, otherwise use built-in infura.
if (web3.eth.net.getNetworkType() !== "mainnet") {
  var web3 = Web3
    ? new Web3(
        new Web3.providers.WebsocketProvider(
          "wss://mainnet.infura.io/ws/v3/7333c8bcd07b4a179b0b0a958778762b"
        )
      )
    : null;
}

var account;
web3.eth.getAccounts().then((f) => {
  account = f[0];
});

cyberDiceAbi = JSON.parse(
  `[{"inputs":[{"internalType":"address[]","name":"_relayers","type":"address[]"},{"internalType":"address","name":"_relayHub","type":"address"},{"internalType":"address","name":"_oracleCon","type":"address"},{"internalType":"uint256","name":"_deadline","type":"uint256"},{"internalType":"uint256","name":"_roundNumber","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"deposit","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"signer","type":"address"},{"indexed":true,"internalType":"uint256","name":"newTickets","type":"uint256"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"Entry","type":"event"},{"anonymous":false,"inputs":[],"name":"RequestBeacon","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"winningTicket","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"prize","type":"uint256"}],"name":"Winner","type":"event"},{"inputs":[],"name":"beacon","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"board","outputs":[{"internalType":"contract MessageBoard","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"computeWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deadline","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"entries","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oracleCon","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"relayHub","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"relayers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"roundNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sendPrize","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_message","type":"string"}],"name":"submit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]`
);
cyberDice = new web3.eth.Contract(cyberDiceAbi);
cyberDice.options.address = "0x3521f13Ff6C0315d7C749081E848FF4A89667aE7";

const totalMessages = 20;
$(document).ready(function () {
  cyberDice.getPastEvents(
    "Entry",
    {
      fromBlock: 0,
      toBlock: "latest",
    },
    function (error, events) {
      for (let i = events.length - 1; i >= 0; i--) {
        const decoded = web3.eth.abi.decodeParameters(
          ["address", "uint", "string"],
          events[i]["raw"]["data"]
        );

        let message = decoded[2];

        // Go through filter to make sure no bad words pop up
        for (let i = 0; i < badWords.length; i++) {
          message = message.replace(badWords[i], "***");
        }

        message = message.replace(/[\S]+.gif/gi, (x) => {
          return `\n<img src="${x}" alt="" onerror="this.onerror=null; this.alt='Gif not found'" width=350 height=350/>\n`;
        });

        $("#messages").append(
          `<tr><td class="cell100 column1">` +
            events[i]["blockNumber"] +
            `</td><td class="cell100 column2" style='white-space: pre'>` +
            message +
            `</td></tr>`
        );
      }

      const toFill = 25;
      if (events.length < toFill) {
        const diff = toFill - events.length;
        for (let i = 0; i < diff; i++) {
          $("#messages").append(
            `<tr><td class="cell100 column1"></td><td class="cell100 column2"></td></tr>`
          );
        }
      }
    }
  );

  cyberDice.methods
    .deadline()
    .call()
    .then((f) => {
      const date = new Date(f * 1000);
      $("#deadline").append(date.toLocaleString());
    });

  web3.eth
    .getBalance("0x3521f13Ff6C0315d7C749081E848FF4A89667aE7")
    .then((f) => {
      $(".prize").append(f.toString());
    });

  cyberDice.methods
    .totalTickets()
    .call()
    .then((f) => {
      $("#totalTickets").append(f.toString());
    });
});
