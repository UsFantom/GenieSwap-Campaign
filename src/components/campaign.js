import { useEffect, useState } from "react";
import Referrer from "./referrer";

function Campaign({ address, search }) {

    const [referralMints, setReferralMints] = useState(0);
    const [totalMintsAmounts, setTotalMintsAmounts] = useState(0);
    const [rootWallets, setRootWallets] = useState([]);
    const [childWallets, setChildWallets] = useState([]);
    const commissionRate = 20;

    const [loading, setLoading] = useState(false);


    const [pageNumber, setPageNumber] = useState(0);
    const PAGE_SIZE = 10;
    const [showChild, setShowChilds] = useState(false);

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

    const needChildsInfo = () => {
        return address.toLocaleLowerCase() === process.env.REACT_APP_ADMIN_ADDRESS || rootWallets.includes(address.toLocaleLowerCase());
    }

    const renderPagenation = () => {

        const totalPages = Math.ceil(childWallets.length / PAGE_SIZE);

        if (totalPages < 2 || search.trim()) {
            return null;
        }

        return (
            <ul className="pagination">
                <a className="cursor-pointer" onClick={() => setPageNumber(0)}>
                    {'<<'}
                </a>
                <a className="cursor-pointer" onClick={() => setPageNumber(Math.max(0, pageNumber - 1))}>
                    {'<'}
                </a>
                {
                    pageNumber > 0 && (
                        <a className="cursor-pointer" onClick={() => setPageNumber(pageNumber - 1)}>
                            {pageNumber}
                        </a>
                    )
                }
                <a className='active'>
                    {pageNumber + 1}
                </a>
                {
                    pageNumber < (totalPages - 1) && (
                        <a className="cursor-pointer" onClick={() => setPageNumber(pageNumber + 1)}>
                            {pageNumber + 2}
                        </a>
                    )
                }
                <a className="cursor-pointer" onClick={() => setPageNumber(Math.min(totalPages - 1, pageNumber + 1))}>
                    {'>'}
                </a>
                <a className="cursor-pointer" onClick={() => setPageNumber(totalPages - 1)}>
                    {'>>'}
                </a>
            </ul>
        );
    }

    return (
        <>
            <div className="campaign-sub-title three-dot-text">{address}</div>
            <div className="campaign-list">
                <div className="campaign-item">
                    <div className="campaign-item-label">
                        Total Revenue
                    </div>
                    <div className="campaign-item-value">
                        {loading ? 'Loading...' : (totalMintsAmounts + referralMints).toPrecision(4)}
                    </div>
                </div>
                <div className="campaign-splitter"></div>
                <div className="campaign-item">
                    <div className="campaign-item-label">
                        Total Commission
                    </div>
                    <div className="campaign-item-value">
                        {loading ? 'Loading...' : (commissionRate / 100.0 * (totalMintsAmounts + referralMints)).toPrecision(4)}
                    </div>
                </div>
                <div className="campaign-splitter"></div>
                <div className="campaign-item">
                    <div className="campaign-item-label">
                        Commision rate
                    </div>
                    <div className="campaign-item-value">
                        {loading ? 'Loading...' : `${commissionRate}%`}
                    </div>
                </div>
                <div className="campaign-splitter"></div>
                <div className={needChildsInfo() ? "campaign-item cursor-pointer" : "campaign-item"} onClick={() => {
                    if (needChildsInfo()) {
                        setShowChilds(!showChild);
                    }
                }
                }>
                    <div className="campaign-item-label">
                        # Of Child Addresses
                    </div>
                    <div className="campaign-item-value">
                        {loading ? 'Loading...' : childWallets.length.toLocaleString()}
                    </div>
                </div>
            </div>
            {
                (showChild || search) && (
                    <div className='table-container'>
                        <table className='referrers-table'>
                            <thead>
                                <tr>
                                    <th>
                                        Referrers
                                    </th>
                                    <th>
                                        Total Revenue
                                    </th>
                                    <th>
                                        Total Commission
                                    </th>
                                    <th>
                                        Commission Rate
                                    </th>
                                    <th>
                                        Child Addresses
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {
                                    search.trim() ?
                                        <>{Array.isArray(childWallets) &&
                                            (childWallets.filter(item => item.indexOf(search) > -1)).map((child) => (
                                                <Referrer key={child.toString()} address={child.toString()} />
                                            ))}</> :
                                        <>{Array.isArray(childWallets) &&
                                            childWallets.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE).map((child) => (
                                                <Referrer key={child.toString()} address={child.toString()} />
                                            ))}</>
                                }
                            </tbody>
                        </table>
                        {renderPagenation()}
                    </div>
                )
            }
        </>
    );
}

export default Campaign;