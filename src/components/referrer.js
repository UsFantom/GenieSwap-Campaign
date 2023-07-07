import { useEffect, useState } from "react";
import { ethers } from "ethers";
import GENIE from "../contract/genie";

function Referrer({ address }) {
    const [childWallets, setChildWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [referrerValue, setReferrerValue] = useState(0);

    useEffect(() => {
        if (address) {
            setLoading(true);
            const promises = [];
            promises.push(fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/countAndAddressesByReferrer?referrer=${address}`));
            Promise.all(promises).then(async (results) => {
                const [result] = results;
                const data = await result.json();

                setChildWallets(data?.data ?? []);
            }).catch(() => { }).finally(() => {
                setLoading(false);
            });
        }
    }, [address]);

    useEffect(() => {
        if(window?.ethereum && address) {
            fetchReferrerValue();
        }
    }, [window?.ethereum, address]);

    const fetchReferrerValue = () => {
        const provider = new ethers.BrowserProvider(window?.ethereum);
        const contract = new ethers.Contract(GENIE.address, GENIE.abi, provider);
        contract.referrerValue(address).then((res) => {
            setReferrerValue(parseInt(res));
        }).catch((err) => {}).finally(() => {});
    };

    return (
        <tr className="table-row">
            <td>
                {address}
            </td>
            <td>
                {loading ? 'Loading...' : (referrerValue * 1e-6).toFixed(2)}
            </td>
            <td>
                {loading ? 'Loading...' : childWallets.length.toLocaleString()}
            </td>
        </tr>
    );
}

export default Referrer;