
export default function Table({ tableHead, tableBody }: { tableHead: String[], tableBody: Object }) {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {tableHead.map((title, index) => (
                            <th key={index} scope="col" className="px-6 py-3">
                                {title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                        {Object.keys(tableBody).map((key, index) => (
                            <td key={index} className="px-6 py-4">
                                {tableBody[key]}
                            </td>
                        ))}

                    </tr>
                </tbody>
            </table>
        </div>
    )
}