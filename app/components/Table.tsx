
export default function Table({ tableHead, tableBody }: { tableHead: string[]; tableBody: object }) {
    return (

        <div className="scroll-container relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full bg-white text-sm text-left rtl:text-right text-gray-500">
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
                    {Array.isArray(tableBody) ? (
                        // If tableBody is an array
                        tableBody.map((item, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                                {Object.entries(item).map(([key, value]) => (
                                    <td key={key} className="px-6 py-4">
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : typeof tableBody === 'object' && tableBody !== null ? (
                        // If tableBody is an object
                        <tr className="odd:bg-white even:bg-gray-50 border-b">
                            {Object.entries(tableBody).map(([key, value]) => (
                                <td key={key} className="px-6 py-4">
                                    {value}
                                </td>
                            ))}
                        </tr>
                    ) : (
                        // Handle if it's neither an array nor an object
                        <tr className="odd:bg-white even:bg-gray-50 border-b">
                            <td colSpan="100%" className="px-6 py-4 text-center">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
