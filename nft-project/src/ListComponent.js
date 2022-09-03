import axios from "axios";
import { useEffect, useState,useContext } from "react";
//import { ReactSession } from "react-client-session";
import { useNavigate,useParams,Link } from "react-router-dom";

import { WalletContext } from "./Context/WalletContext";
import { NetworkContext } from "./Context/NetworkContext";

import FetchLoader from "./Loaders/FetchComponent";
import ListLoader from "./Loaders/ListLoader";

import { signAndConfirmTransaction } from "./utility/common";
import SuccessLoader from "./Loaders/SuccessLoader";


const ListAll = () => {
    const navigate = useNavigate();
    const {waddress} = useParams();
    const { walletId, setWalletId } = useContext(WalletContext);
    const {network, setNetwork} = useContext(NetworkContext);
    
    const [nfts, setNfts] = useState(null);
    const [loaded,setLoaded] = useState(false);

    const [mssg,setMssg] = useState("");

    useEffect(() => {
        if (!waddress) {
            console.log('Wallet Not connected')
            navigate('/');
        }
        else {
            setWalletId(waddress);
        }
    }, []);
    
    //Required Code
    useEffect(() => {
        const xKey = process.env.REACT_APP_API_KEY.toString();
        const endPoint = process.env.REACT_APP_URL_EP;
        setMssg("");
        
        let nftUrl = `${endPoint}nft/read_all?network=${network}&address=${waddress}&refresh=refresh`;

        axios({
            // Endpoint to get NFTs
            url: nftUrl,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": xKey,
            },
          })
            // Handle the response from backend here
            .then((res) => {
              console.log(res.data);
              if(res.data.success === true)
                setNfts(res.data.result);
              else
              {
                  setMssg("Some Error Occured");
                  setNfts([]);
              }
              setLoaded(true);
              //ReactSession.set("nfts", res.data.result);
              //setLoaded(true);
            })
            // Catch errors if any
            .catch((err) => {
              console.warn(err);
              setMssg(err.message);
              setNfts([]);
              setLoaded(true);
            });
    },[walletId,network]);

    //all functions required for listing
    const [listingNFT,setListingNFT] = useState(null);
    const [listingName,setListingName] = useState(null);
    const [listingURI,setListingURI] = useState(null);
    const [listingPrice,setListingPrice] = useState();
    const [showLister,setShowLister] = useState(false);
    const [okModal,setOkModal] = useState(false);

    const [errMessg,setErrMessg] = useState('');
    
    const lister = (nft_addr,nftname,nfturi) => {
      setListingNFT(nft_addr);
      setListingName(nftname);
      setListingURI(nfturi);
      setShowLister(true);
    }
    const callback = (signature,result) => {
      console.log("Signature ",signature);
      console.log("result ",result);
      try {
        if(signature.err === null)
        {
          console.log('ok');
          navigate(`/my-listings`);
        }
        else
        {
          console.log('failed');
        }
        setOkModal(false);
      } catch (error) {
        console.log('failed');
        setOkModal(false);
      }
      
    }

    const listNFT = (nft_addr) => {
        const xKey = process.env.REACT_APP_API_KEY;
        const endPoint = process.env.REACT_APP_URL_EP;
        const marketplaceAddress = process.env.REACT_APP_MARKPLACE;
        
        
        let nftUrl = `${endPoint}marketplace/list`;

        axios({
            // Endpoint to list
            url: nftUrl,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": xKey,
            },
            data: {
                network:'devnet',
                marketplace_address: marketplaceAddress,
                nft_address: nft_addr,
                price: Number(listingPrice),
                seller_wallet: walletId
                
            }
          })
            // Handle the response from backend here
            .then(async (res) => {
              console.log(res.data);
              if(res.data.success === true)
              {
                setOkModal(true);
                setShowLister(false);
                const transaction = res.data.result.encoded_transaction;
                const ret_result = await signAndConfirmTransaction('devnet',transaction,callback);
                console.log(ret_result);
              }
              
            })
            // Catch errors if any
            .catch((err) => {
              console.warn(err);
              setErrMessg(err.message);
              navigate(`/my-listings`);
              //setShowLister(false);
            });
    }
    const closePopupList = () => {
      setShowLister(false);
    }
    
    
    return (
      <div>
        {!loaded && <FetchLoader />}
        {showLister && <ListLoader listingNFT={listingNFT} listingName={listingName} listingURI={listingURI} listingPrice={listingPrice} setListingPrice={setListingPrice} listNFT={listNFT} closePopupList={closePopupList} errMessg={errMessg} />}
        {okModal && <SuccessLoader />}
        <div className="right-al-container">
          <div className="container-lg">

            <div className="row">
              <div className="col-9">
                <h2 className="section-heading">
                  {loaded && `${nfts.length} NFT(s) Found`}
                </h2>
              </div>
              <div className="col-3">
                <div className="white-form-group">
                  <select
                    name="network"
                    className="form-control form-select"
                    id=""
                    onChange={(e) => {
                      setLoaded(false);
                      setNfts(null);
                      setNetwork(e.target.value);
                    }}
                    value={network}
                  >
                    <option value="mainnet-beta">Mainnet</option>
                    <option value="devnet">Devnet</option>
                    <option value="testnet">Testnet</option>

                    {/* <option value="testnet">Testnet</option>
                                <option value="mainnet">Mainnet</option> */}
                  </select>
                </div>
              </div>
            </div>
            {mssg && (
              <div className="pt-5 text-center">
                <p className="p-para">{mssg}</p>
              </div>
            )}
            <div className="row">

              {loaded &&
                nfts.map((nft) => (
                  <div
                    className="col-6 col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-3 port-cust-padding"
                    key={nft.mint}
                  >
                    <div className="cards-outer-port">
                      <div className="inner-box">
                        <Link
                          to={`/get-details?token_address=${nft.mint}&network=${network}`}
                          style={{ textDecoration: "none" }}
                        >
                          <div className="inner-box-img-container">
                            <img src={nft.image_uri} alt="NftImage" />
                          </div>
                        </Link>
                        <div className="row pt-3 pb-2">
                          <div className="col-12 col-xl-6">
                            <p
                              className="port-para-2 text-center text-xl-start"
                              style={{ wordWrap: "break-word" }}
                            >
                              {nft.name}
                            </p>
                          </div>
                          {/* <div className="col-12 col-xl-6 pt-1">
                            {nft.update_authority === waddress ? (
                              <div className="white-sm-btn-upd">
                                <Link
                                  className="btn linker"
                                  to={`/update?token_address=${nft.mint}&network=${network}`}
                                >
                                  Update
                                </Link>
                              </div>
                            ) : (
                              <div
                                className="white-sm-btn-upd disabled"
                                data-bs-toggle="tooltip"
                                title="You do not have update authority for this NFT"
                              >
                                <Link className="btn linker" to={`#`}>
                                  Update
                                </Link>
                              </div>
                            )}
                          </div> */}
                          <div className="col-12 col-xl-6 pt-1 px-3">
                            <div className="white-button-container-sm" ><button onClick={() => lister(nft.mint,nft.name,nft.image_uri)}>List</button></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
}
 
export default ListAll;