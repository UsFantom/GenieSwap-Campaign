import { useEffect, useState } from "react";
import { ethers } from "ethers";
import GENIE from "../contract/genie";

function Referrer({ address }) {
    const [childWallets, setChildWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [referrerValue, setReferrerValue] = useState(0);
    const [referralMints, setReferralMints] = useState(0);
    const [totalMintsAmounts, setTotalMintsAmounts] = useState(0);

    useEffect(() => {
        if (address) {
            setLoading(true);
            const promises = [];
            promises.push(fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/countAndAddressesByReferrer?referrer=${address}`));
            promises.push(fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/getMintsInfo?wallet=${address}`));
            Promise.all(promises).then(async (results) => {
                const [result1, result2] = results;
                const data1 = await result1.json();
                const data2 = await result2.json();

                setChildWallets(data1?.data ?? []);
                setReferralMints(data2?.data?.referralMints ?? 0);
                setTotalMintsAmounts(data2?.data?.totalMintAmounts ?? 0);
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
            <td>{loading ? 'Loading...' : '$' + totalMintsAmounts.toFixed(2)}</td>
            <td>
                {loading ? 'Loading...' : '$' + (referrerValue * 1e-6).toFixed(2)}
            </td>
            <td>
                {loading ? 'Loading...' : childWallets.length.toLocaleString()}
            </td>
        </tr>
    );
}

export default Referrer;