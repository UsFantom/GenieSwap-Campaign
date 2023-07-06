import { useEffect, useState } from "react";

function Referrer({ address }) {

    const [referralMints, setReferralMints] = useState(0);
    const [totalMintsAmounts, setTotalMintsAmounts] = useState(0);
    const [rootWallets, setRootWallets] = useState([]);
    const [childWallets, setChildWallets] = useState([]);
    const commissionRate = 20;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address) {
            setLoading(true);
            const promises = [];
            promises.push(fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/countAndAddressesByReferrer?referrer=${address}`));
            promises.push(fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/root-wallets`));
            promises.push(fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/getMintsInfo?wallet=${address}`));
            Promise.all(promises).then(async (results) => {
                const [result1, result2, result3] = results;
                const data1 = await result1.json();
                const data2 = await result2.json();
                const data3 = await result3.json();

                setChildWallets(data1?.data ?? []);
                setRootWallets(data2);
                setReferralMints(data3?.data?.referralMints ?? 0);
                setTotalMintsAmounts(data3?.data?.totalMintAmounts ?? 0);
            }).catch(() => { }).finally(() => {
                setLoading(false);
            });
        }
    }, [address]);

    return (
        <tr className="table-row">
            <td>
                {address}
            </td>
            <td>
                {loading ? 'Loading...' : (totalMintsAmounts + referralMints).toPrecision(4)}
            </td>
            <td>
                {loading ? 'Loading...' : (commissionRate / 100.0 * (totalMintsAmounts + referralMints)).toPrecision(4)}
            </td>
            <td>
                {loading ? 'Loading...' : `${commissionRate}%`}
            </td>
            <td>
                {loading ? 'Loading...' : childWallets.length.toLocaleString()}
            </td>
        </tr>
    );
}

export default Referrer;