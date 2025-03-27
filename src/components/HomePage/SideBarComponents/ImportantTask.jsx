
import { useContext, useEffect, useState } from 'react';
import UseAxiosPublic from '../../Auth/UseAxiosPublic';
import { Card } from 'flowbite-react';
import { AuthC } from '../../Auth/AuthProviderx';
import { Helmet } from 'react-helmet';

const ImportantTask = () => {
    const {user} = useContext(AuthC); 
    const [tasks, setTasks] = useState([]);
    const axiosPublic = UseAxiosPublic();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosPublic.get('/allTasks?category=In Progress'); // Filter for "In Progress"
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching In Progress tasks:', error);
            }
        };

        fetchTasks();
    }, [axiosPublic]);
    const filteredInPTasks = tasks.filter(({ userEmail }) => 
        userEmail === user?.email
      );
    return (
        <div>
            <Helmet>
        <title>Taskman || In Progress</title>
    </Helmet>
            <h2 className='text-3xl font-semibold text-center mb-5'>In Progress Tasks</h2> {/* Updated heading */}
            {filteredInPTasks.length === 0 ? (
                <p>No In Progress tasks found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInPTasks?.map((data) => (
                        <Card key={data._id} className="shadow-2xl shadow-black min-w-64 sm:min-w-72 md:min-w-64 lg:min-w-72 xl:min-w-80 max-w-64 sm:max-w-72 md:max-w-64 lg:max-w-72 xl:max-w-80 mx-auto bg-green-100 rounded-md">
                            <div>
                                <p className="text-xl font-semibold">{data.title}</p>
                                <h1 className="opacity-70 my-2">{data.description}</h1>
                                <h1 className=" text-xs my-2">Task Created On: {data.timestamp}</h1>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImportantTask;