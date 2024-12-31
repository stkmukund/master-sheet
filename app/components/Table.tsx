
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
                    {Object.entries(tableBody).map(([key, value]) => (
                        <tr key={key} className="odd:bg-white even:bg-gray-50 border-b">
                            {value.map((data: string, index: string) => (
                                <td key={index} className="px-6 py-4">
                                    {data}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
