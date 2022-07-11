export const checkWallet = async(window) =>{
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Please install metamask");
    }else{
      console.log('Wallet exists');
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      return account;
    } else {
      console.log("No authorized account found");
      connectWallet(window);
    }
  }

export const connectWallet = async(window) =>{
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      return accounts[0];
    } catch (err) {
      console.log(err)
    }
     
  }