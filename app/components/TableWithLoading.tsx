import React from 'react'

export default function TableWithLoading() {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Product name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Color
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Category
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Price
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <td key={index} className="px-6 py-4 ">
                                <p className='animate-pulse bg-blue-100 p-2 rounded'></p>
                            </td>
                        ))}

                    </tr>
                </tbody>
            </table>
        </div>
    )
}
