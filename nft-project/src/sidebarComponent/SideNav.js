import { useState,useEffect,useContext } from "react";
import { useLocation,useNavigate,Link  } from "react-router-dom";
import axios from "axios";
import {  clusterApiUrl, Connection,PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { connectTheWallet } from "../utility/common";

import { DomainContext } from "../Context/DomainContext";
import { WalletContext } from "../Context/WalletContext";

import wallIcon from '../resources/images/sidebar/wallet-icon.svg';
import dashIcon from '../resources/images/sidebar/dashboard-icon.svg';
import createIcon from '../resources/images/sidebar/create-icon.svg';


const SideNav = () => {
  const { walletId, setWalletId } = useContext(WalletContext);
  const { solDomainsApp,setSolDomainApp } = useContext(DomainContext);
  const location_get = useLocation();
  //console.log(location_get.pathname);

  //console.log('location now:',location_get.pathname);
  
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(true);
  
  const openNav = () => {
    document.getElementById("mySidenav").style.width = "250px";
    setOpen(false);
  };
  const closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
    setOpen(true);
  };
  
  

  const solanaConnect = async () => {
    console.log('clicked solana connect');
    const resp = await connectTheWallet();
        console.log(resp);
        setWalletId(resp.addr);
        navigate('/wallet/' + resp.addr);

  }

  useEffect(() => {
    const endPoint = process.env.REACT_APP_URL_EP;
    const xKey = process.env.REACT_APP_API_KEY.toString();
    let reqUrl = `${endPoint}wallet/get_domains?network=mainnet-beta&wallet=${walletId}`;
      if(walletId)
      {
        axios({
          url: reqUrl,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": xKey,
          },
        })
          .then((res) => {
            console.log(res.data);
            if (res.data.result[0]) {
              setSolDomainApp(res.data.result[0].name);
            }
            else {
              setSolDomainApp(null);
            }
          })
          .catch((err) => {
            console.warn(err);
            setSolDomainApp(null);
          });
      }
      
        // console.log(solDomain);
    
  }, [walletId]);
  
  return (
    <div>
      <div className="w-100 text-end" style={{height: "60px"}}>
        {(!isOpen) ? (<br/>) : (
        <button className="close-sidepanel" onClick={openNav} style={{marginTop: "60px",zIndex: "9"}}>
          <div className="custom-hamburg">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </button>
        )}
      </div>
      <div id="mySidenav" className="sidenav">
      
      <div className="row sidemenu-wall ms-2">
            <div className="col-3 align-self-center">
              <img src={wallIcon} alt="dashboard" />
            </div>
            <div className="col-9 align-self-center wallet-text-side">
                {(solDomainsApp)?(solDomainsApp):
                (
                  (walletId)?(walletId.substring(0, 5)+'.....'+walletId.substring((walletId.length)-5)):(<button onClick={solanaConnect}>Connect Wallet</button>)
                )}
            </div>
          </div>
        
        <hr className="divider" />
        <a id="cls-button" className="closebtn" onClick={closeNav}>
          Dismiss
        </a>
        <Link className={(location_get.pathname!=='/create'&&location_get.pathname!=='/connect-wallet')?"active":""} to={(walletId===null)?`/`:`/wallet/${walletId}`}>
        {/* <Link to={(walletId===null)?`/`:`/wallet/${walletId}`}> */}
            <div className="row sidemenu-anc">
              <div className="col-3">
                <img src={dashIcon} alt="dashboard" />
              </div>
              <div className="col-9">
                <p>All NFTs</p>
              </div>
            </div>
        </Link>
        <Link to={(walletId===null)?`/connect-wallet`:`/create`} className={(location_get.pathname==='/create'||location_get.pathname==='/connect-wallet')?"active":""}>
        {/* <Link to="/create"> */}
            <div className="row sidemenu-anc">
              <div className="col-3">
                <img src={createIcon} alt="Create" />
              </div>
              <div className="col-9">
                <p>Create NFT</p>
              </div>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default SideNav;
