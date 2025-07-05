import { ethers } from 'ethers';

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.isConnected = false;
  }

  // MetaMask bağlantısını kontrol et
  async checkMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      console.log('✅ MetaMask detected');
      return true;
    } else {
      console.log('❌ MetaMask not detected');
      return false;
    }
  }

  // Wallet'ı bağla
  async connectWallet() {
    try {
      if (!await this.checkMetaMask()) {
        throw new Error('MetaMask not installed');
      }

      console.log('🔗 Connecting to MetaMask...');
      
      // MetaMask'a bağlan
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Hesap erişimi iste
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.isConnected = true;

      console.log('✅ Wallet connected:', this.address);
      
      // Network kontrolü
      const network = await this.provider.getNetwork();
      console.log('🌐 Connected to network:', network.name, network.chainId);

      return {
        success: true,
        address: this.address,
        network: network.name,
        chainId: network.chainId
      };

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      this.isConnected = false;
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Wallet bağlantısını kes
  async disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.isConnected = false;
    console.log('🔌 Wallet disconnected');
  }

  // Mevcut bağlantıyı kontrol et
  async checkConnection() {
    try {
      if (!await this.checkMetaMask()) {
        return false;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.address = accounts[0];
        this.isConnected = true;
        
        console.log('✅ Wallet already connected:', this.address);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      return false;
    }
  }

  // Network değiştir
  async switchNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      console.log('✅ Network switched to:', chainId);
      return true;
    } catch (error) {
      console.error('❌ Network switch failed:', error);
      return false;
    }
  }

  // Bakiye getir
  async getBalance() {
    try {
      if (!this.isConnected || !this.provider) {
        throw new Error('Wallet not connected');
      }

      const balance = await this.provider.getBalance(this.address);
      const balanceInEth = ethers.formatEther(balance);
      
      console.log('💰 Wallet balance:', balanceInEth, 'ETH');
      return balanceInEth;
    } catch (error) {
      console.error('❌ Balance fetch failed:', error);
      return '0';
    }
  }

  // Wallet event listener'ları
  setupEventListeners(onAccountChange, onNetworkChange) {
    if (window.ethereum) {
      // Hesap değişikliği
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('🔄 Account changed:', accounts[0]);
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          this.address = accounts[0];
        }
        if (onAccountChange) onAccountChange(accounts[0]);
      });

      // Network değişikliği
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('🔄 Network changed:', chainId);
        if (onNetworkChange) onNetworkChange(chainId);
      });
    }
  }

  // Getter methods
  getAddress() {
    return this.address;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
const walletService = new WalletService();
export default walletService; 