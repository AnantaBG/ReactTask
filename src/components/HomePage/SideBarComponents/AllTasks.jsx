import { Table, Pagination } from 'flowbite-react';
import { useEffect, useState } from "react";
import UseAxiosPublic from '../../Auth/UseAxiosPublic';
import { FaTag, FaListUl, FaDollarSign, FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp, FaSearch } from 'react-icons/fa'; // Import sorting icons
import Loading from '../Loading';

const AllTasks = () => {
    const axiosPublic = UseAxiosPublic();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState('ascending');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6); // Default for sm and below
    const [paginationPages, setPaginationPages] = useState(2); // Default for sm and below

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosPublic.get('/allData');
                setTasks(response.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [axiosPublic]);

    useEffect(() => {
        // Filter tasks based on search term
        const results = tasks.filter(task =>
            task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTasks(results);
        setCurrentPage(1); // Reset page when search term changes
    }, [searchTerm, tasks]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint
                setItemsPerPage(8);
                setPaginationPages(2);
            } else {
                setItemsPerPage(6);
                setPaginationPages(2); // Ensure only 2 pages are shown on small devices
            }
        };
        handleResize();

        window.addEventListener('resize', handleResize);

        // Cleanup listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [key, direction] = value.split(':');
        setSortBy(key);
        setSortDirection(direction);
        setCurrentPage(1); // Reset page when sort changes

        // Update the select field value
        const selectElement = document.getElementById('sort');
        if (selectElement) {
            selectElement.value = value;
        }
    };

    const sortedTasks = () => {
        let sortableItems = [...filteredTasks];
        if (sortBy) {
            sortableItems.sort((a, b) => {
                const isAscending = sortDirection === 'ascending';
                let comparison = 0;
                if (a[sortBy] < b[sortBy]) {
                    comparison = -1;
                } else if (a[sortBy] > b[sortBy]) {
                    comparison = 1;
                }
                return isAscending ? comparison : comparison * -1;
            });
        }
        return sortableItems;
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedTasks().slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(sortedTasks().length / itemsPerPage);

    const onPageChange = (page) => {
        setCurrentPage(page);
    };

    const getSortIcon = (key) => {
        if (sortBy !== key) {
            return null;
        }
        return sortDirection === 'ascending' ? <FaSortAlphaUp className="ml-1" /> : <FaSortAlphaDown className="ml-1" />;
    };

    const getValueSortIcon = (key) => {
        if (sortBy !== key) {
            return null;
        }
        return sortDirection === 'ascending' ? <FaSortNumericUp className="ml-1" /> : <FaSortNumericDown className="ml-1" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen ">
              <Loading />
            </div>
          );
      }

    if (error) {
        return <p>Error fetching tasks: {error.message}</p>;
    }

    return (
        <div>
            <div className="flex flex-col mt-">
                <h1 className='text-2xl flex justify-center mx-auto text-center font-bold mb-1'>All Items</h1>
                <hr />
                <div className="mb-4 mt-4 flex justify-center w-full mx-auto">
                    <div className='flex flex-col sm:flex-row gap-4 w-full max-w-lg'> {/* Added max-w-lg */}
                        <div>
                            <label htmlFor="sort" className="text-gray-700 text-sm font-bold mb-2 block">
                                Sort By:
                            </label>
                            <select
                                id="sort"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={`${sortBy}:${sortDirection}`}
                                onChange={handleSortChange}
                            >
                                <option value="">Default Sorting</option>
                                <option value="category:ascending">Category (A-Z)</option>
                                <option value="category:descending">Category (Z-A)</option>
                                <option value="value:ascending">Price (Low to High)</option>
                                <option value="value:descending">Price (High to Low)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="search" className="block text-gray-700 text-sm font-bold mb-2">
                                Search:
                            </label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaSearch className="text-gray-500 dark:text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Search by item name or category"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table hoverable={true}>
                        <Table.Head className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                            <Table.HeadCell>
                                <div className="flex items-center">
                                    <FaTag className="mr-2" />
                                    Item Name
                                </div>
                            </Table.HeadCell>
                            <Table.HeadCell>
                                <div className="flex items-center">
                                    <FaListUl className="mr-2" />
                                    Category {sortBy === 'category' && getSortIcon('category')}
                                </div>
                            </Table.HeadCell>
                            <Table.HeadCell>
                                <div className="flex items-center">
                                    <FaDollarSign className="mr-2" />
                                    Value {sortBy === 'value' && getValueSortIcon('value')}
                                </div>
                            </Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {currentItems.map(item => (
                                <Table.Row key={item.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.category}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.value}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-center  mt-4 ">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            showIcons
                            layout="pagination"
                            previousLabel="Previous"
                            className='overflow-auto'
                            nextLabel="Next"
                            itemsPerPage={paginationPages}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllTasks;