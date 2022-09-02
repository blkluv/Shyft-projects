import { useState,useContext,useEffect } from "react";
import { useNavigate,useParams,Link } from "react-router-dom";
import axios from "axios";


import { WalletContext } from "./Context/WalletContext";



const TheMarketplace = () => {
    const navigate = useNavigate();
    const {waddress} = useParams();
    const network = "devnet";
    const [loaded,setLoaded] = useState(false);
    const [nfts,setNfts] = useState(null);
    const [mssg,setMssg] = useState('');

    const { walletId, setWalletId } = useContext(WalletContext);

    // useEffect(() => {
    //     if (!waddress) {
    //         console.log('Wallet Not connected')
    //         navigate('/');
    //     }
    //     else {
    //         setWalletId(waddress);
    //     }
    // }, []);

    //Required Code to fetch data from the marketplace
    useEffect(() => {
        const xKey = process.env.REACT_APP_API_KEY;
        const endPoint = process.env.REACT_APP_URL_EP;
        setMssg("");
        
        let nftUrl = `123${endPoint}marketplace/active_listings?network=${network}&marketplace_address=54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB'`;

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
    },[walletId]);

    
    return ( 
        <div>
            <div className="right-al-container mb-2">
                <div className="container-lg bg-primary">
                    <div className="marketplace-lp">
                        <h2 className="section-heading">NFT Marketplace</h2>
                        {mssg && (
                        <div className="pt-5 text-center">
                            <p className="p-para">{mssg}</p>
                        </div>
                        )}
                        <div className="row mt-4">
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
                                <div className="col-12 col-xl-6 pt-1">
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
                                    {/* <div className={(nft.update_authority === waddress)?"white-sm-btn-upd":"white-sm-btn-upd disabled"} data-bs-toggle={(nft.update_authority === waddress)?"":"tooltip"} title="You do not have update authority for this NFT">
                                    
                                    <Link
                                        className="btn linker"
                                        to={(nft.update_authority === waddress)?`/update?token_address=${nft.mint}&network=${network}`:`#`}
                                        
                                    >
                                        Update
                                    </Link>
                                    </div> */}
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
        </div>
     );
}
 
export default TheMarketplace;