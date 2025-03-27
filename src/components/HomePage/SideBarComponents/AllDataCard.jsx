/* eslint-disable no-unused-vars */
import { Button, Card, Textarea, TextInput } from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import { BiEdit, BiTrash, BiX } from "react-icons/bi";
import { CgAdd } from "react-icons/cg";
import { MdDoneAll } from "react-icons/md";
import { RiProgress1Fill, RiTodoFill } from "react-icons/ri";
import UseAxiosPublic from "../../Auth/UseAxiosPublic";
import { AuthC } from "../../Auth/AuthProviderx";
import DropArea from "./DropArea";
import Swal from "sweetalert2";
import Loading from "../Loading";

const AllDataCard = () => {
    const {user} = useContext(AuthC);
    const axiosPublic = UseAxiosPublic();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", category: "To-Do" });
    const [cardData, setCardData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [todoDisabled, setTodoDisabled] = useState(true);
    const [inProgressDisabled, setInProgressDisabled] = useState(false);
    const [doneDisabled, setDoneDisabled] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false); // Add a loading state
    const [dragging, setDragging] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState(null); // Store the ID
    const [dropTargetId, setDropTargetId] = useState(null); // Store the ID of the target

    if (isLoading) {
        <Loading></Loading>
    }
    const handleDragStart = (e, itemId) => { // Now receives itemId
        setDragging(true);
        setDraggedItemId(itemId); // Store the ID
        e.dataTransfer.setData('text/plain', itemId); // Still needed for some browsers
    };

    const handleDragOver = (e, targetItemId) => { // Now receives targetItemId
        e.preventDefault();
        setDropTargetId(targetItemId); // Store the ID of the target
    };

    const handleDragEnd = () => {
        setDragging(false);
        setDraggedItemId(null);
        setDropTargetId(null);
    };

const handleDrop = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!draggedItemId ||!dropTargetId || draggedItemId === dropTargetId) {
        return;
    }

    // 1. Update the local state to reflect the new order
    const newCardData = [...cardData];
    const draggedIndex = newCardData.findIndex(task => task._id === draggedItemId);
    const dropIndex = newCardData.findIndex(task => task._id === dropTargetId);

    if (draggedIndex === -1 || dropIndex === -1) {
        return; // Handle not found
    }

    const [removed] = newCardData.splice(draggedIndex, 1);
    newCardData.splice(dropIndex, 0, removed);

    setCardData(newCardData); 

    newCardData.forEach((task, index) => {
        task.order = index; 
    });


    try {
        const updatePromises = newCardData.map(task => {
            const url = `/alltasks/${task._id}`;
            return axiosPublic.patch(url, { order: task.order });
        });

        await Promise.all(updatePromises);
        setCardData(newCardData);
    } catch (error) {
        console.error("Error updating task order:", error);
        setRefresh(!refresh);
        setIsLoading(false);
    }

    setDragging(false);
    setDraggedItemId(null);
    setDropTargetId(null);
};

    const showSwal = (icon, title, text, timer = 2000, showConfirmButton = false) => {
        Swal.fire({
            icon,
            title,
            text,
            timer,
            showConfirmButton
        });
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosPublic.get('/allTasks');
                if (!response.data) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setCardData(response.data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, [refresh, axiosPublic]);

    const handleUpdateTask = (task) => {
        setSelectedTask(task);
        setNewTask({ title: task.title, description: task.description, category: task.category });
        setUpdateModalOpen(true);

        setTodoDisabled(task.category === "To-Do");
        setInProgressDisabled(task.category === "In Progress");
        setDoneDisabled(task.category === "Done");
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            });
    
            if (result.isConfirmed) {
                const response = await axiosPublic.delete(`/alltasks/${taskId}`);
    
                if (!response.data) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                setCardData(cardData.filter(task => task._id !== taskId));
    
                showSwal('success', 'Deleted!', 'Your task has been deleted.');
            } else if (result.isDismissed) {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    showSwal('info', 'Cancelled', 'Task deletion cancelled', 1500); 
                }
            }
    
        } catch (error) {
            showSwal('error', 'Error!', error.message || 'Failed to delete task.');
        }
    };

    const handleCloseUpdateModal = () => {
        setUpdateModalOpen(false);
        setSelectedTask(null);
        setNewTask({ title: "", description: "", category: "" });
        setTodoDisabled(false);
        setInProgressDisabled(false);
        setDoneDisabled(false);
    };

    const handleAddTask = () => {
        setModalOpen(true);
        setTodoDisabled(false);
        setInProgressDisabled(false);
        setDoneDisabled(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setNewTask({ title: "", description: "", category: "" });
    };

    const handleInputChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleCategoryClick = (taskId, category) => {
        const updatedCardData = cardData.map(task => {
            if (task._id === taskId) {
                return { ...task, category: category };
            }
            return task;
        });

        setCardData(updatedCardData);

        if (category === "To-Do") {
            setTodoDisabled(true);
            setInProgressDisabled(false);
            setDoneDisabled(false);
        } else if (category === "In Progress") {
            setTodoDisabled(false);
            setInProgressDisabled(true);
            setDoneDisabled(false);
        } else if (category === "Done") {
            setTodoDisabled(true);
            setInProgressDisabled(true);
            setDoneDisabled(true);
        }

        axiosPublic.patch(`/alltasks/${taskId}`, { category }).then(() => {
            setRefresh(!refresh);
        }).catch(error => {
            console.error("Error updating task category:", error);
        });
    };
    useEffect(() => {
      const intervalId = setInterval(() => {
          setCurrentDate(new Date());
        }, 1000);
            return () => clearInterval(intervalId);
      }, []);

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        const title = newTask.title.trim();
        const description = newTask.description.trim();
    
        if (!title) {
            showSwal('warning', 'Warning!', 'Task title is required.');
            return;
        }
        if (!description) {
            showSwal('warning', 'Warning!', 'Task description is required.');
            return;
        }
    
        if (title.length > 50) {
            showSwal('warning', 'Warning!', 'Task title must be at most 50 characters.');
            return;
        }
    
        if (description.length > 200) {
            showSwal('warning', 'Warning!', 'Task description must be at most 200 characters.');
            return;
        }
    
        try {
          const timestamp = currentDate.toISOString().split('T')[0] + ' ' + currentDate.toLocaleTimeString();;
    
          const newTaskWithId = { 
            ...newTask,
            title: title,
            description: description,
            userEmail: user.email,
            timestamp: timestamp
        };

        const response = await axiosPublic.post('/alltasks', newTaskWithId);
    
            if (!response.data) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            setRefresh(!refresh);
            handleCloseModal(); 
            setNewTask({ title: "", description: "", category: "To-Do" }); 
          setCardData(prevCardData => [...prevCardData, response.data]);
          showSwal('success', 'Congratulations!', 'New Task Added'); 

        } catch (error) {
            showSwal('error', 'Error!', error.message || "An error occurred while adding the task.");

        }
        
    };

    const handleUpdateSubmit = async (e) => {
      e.preventDefault();
  
      const title = newTask.title.trim();
      const description = newTask.description.trim();

    if (title.length > 50) {
        showSwal('warning', 'Warning!', 'Updated Task title must be at most 50 characters.');
        return;
    }

    if (description.length > 200) {
        showSwal('warning', 'Warning!', 'Updated Task description must be at most 200 characters.'); 
        return;
    }
  
      try {
          const updatedTask = {
              ...newTask,
              title: title,  // Use trimmed title
              description: description, // Use trimmed description
          };
  
          const response = await axiosPublic.patch(`/alltasks/${selectedTask._id}`, updatedTask);
          if (!response.data) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          setRefresh(!refresh);
          handleCloseUpdateModal();
          showSwal('success', 'Congratualtions!', 'Task Updated Successfully'); 
          setNewTask({ title: "", description: "", category: "" });
  
      } catch (error) {
        showSwal('error', 'Error!', `${error.message}`); 
      }
  };
    const filteredTasks = cardData.filter(({ userEmail }) => 
      userEmail === user?.email
    );
    const onDragStart = (e, itemId) => { // Pass itemId to onDragStart
        setDraggedItemId(itemId); // Store the dragged item's ID
        e.dataTransfer.setData('text/plain', itemId); // This is still important
    };

    const [targetCategory, setTargetCategory] = useState(null)

    const onDrop = (targetCategory) => { 
        if (!draggedItemId || !targetCategory) {
            return;
        }

        let originalCategory;

        setCardData(prevCardData => {
            return prevCardData.map(task => {
                if (task._id === draggedItemId) {
                    originalCategory = task.category;
                    return { ...task, category: targetCategory };
                }
                return task;
            });
        });

        axiosPublic.patch(`/alltasks/${draggedItemId}`, { category: targetCategory })
            .then(() => {
                setRefresh(!refresh);
                showSwal('success', 'Succss!', 'Category Changed Successfully'); 
            })
            .catch(error => {
                console.error("Error updating task category:", error);
                setCardData(prevCardData => {
                    return prevCardData.map(task => {
                        if (task._id === draggedItemId) {
                            return { ...task, category: originalCategory };
                        }
                        return task;
                    });
                });
                showSwal('info', 'Error', 'Can`t Move to the Same Category'); 
            })
            .finally(() => setDraggedItemId(null)); 
    };
    return (
        <div className="grid lg:grid-cols-3  md:grid-cols-2 sm:grid-cols-1 grid-cols-1 gap-2">
            <DropArea onDrop={() => onDrop("To-Do")} onDragEnter={() => setTargetCategory("To-Do")}>To Do</DropArea>
            <DropArea onDrop={() => onDrop("In Progress")} onDragEnter={() => setTargetCategory("In Progress")}>In Progress</DropArea>
            <DropArea onDrop={() => onDrop("Done")} onDragEnter={() => setTargetCategory("Done")}>Done</DropArea>

            {filteredTasks.map((data , index) => (
                <div key={data._id}>
<Card key={data._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, data._id)} // Pass data._id
                    onDragOver={(e) => handleDragOver(e, data._id)}   // Pass data._id
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    className={`shadow-2xl min-h-[260px] max-h-[600px] shadow-black min-w-48 active:opacity-70 cursor-grab sm:min-w-68 md:min-w-56 lg:min-w-68 xl:min-w-80 max-w-48 sm:max-w-72 md:max-w-56 lg:max-w-68 xl:max-w-80 mx-auto bg-green-100 rounded-md 
                    ${dragging && draggedItemId === data._id ? 'opacity-50' : ''}  // Use draggedItemId
                    ${dropTargetId === data._id ? 'border-2 border-blue-500' : ''} // Use dropTargetId
                    `}>
                    <div className="w-full">
                        <p className="text-xl font-semibold">{data.title}</p>
                        <h1 className="opacity-70 my-2 text-xs ">{data.description}</h1>
                        <h1 className="text-sm my-2 font-bold">{data.category}</h1>
                        <h1 className=" text-xs my-2">Task Created On: {data.timestamp}</h1>
                      </div>
                    <div className="w-full">
                        <div className="flex gap-1 mx-auto justify-center">
                        <Button className="sm:block hidden"
                         onClick={() => handleCategoryClick(data._id, "To-Do")}
                         disabled={data.category === "To-Do" || data.category === "Done"}>
                          <RiTodoFill />
                        </Button>
                        <Button 
                         className="bg-slate-500" 
                         onClick={() => handleCategoryClick(data._id, "In Progress")}
                         disabled={data.category === "In Progress" || data.category === "Done"} >
                          <RiProgress1Fill />
                        </Button>
                        <Button
                        className="bg-green-400" 
                        onClick={() => handleCategoryClick(data._id, "Done")} 
                        disabled={data.category === "Done"} >
                          <MdDoneAll />
                        </Button>
                            <Button onClick={() => handleUpdateTask(data)} className="bg-stone-500">
                                <BiEdit />
                            </Button>
                        </div>
                        <div className="flex justify-center mx-auto mt-10">
                            <Button className="bg-red-600" onClick={() => handleDeleteTask(data._id)}>
                                <BiTrash />
                            </Button>
                        </div>
                    </div>
                </Card>
                </div>
                
            ))}
            <Card
                onClick={handleAddTask}
                className="shadow-2xl max-h-[320px] shadow-black min-w-48 sm:min-w-72 md:min-w-56 lg:min-w-68 xl:min-w-80 max-w-48 sm:max-w-72 md:max-w-56 lg:max-w-68 xl:max-w-80 mx-auto bg-green-100 rounded-md"
            >
                <div className="flex flex-col justify-center items-center">
                    <CgAdd className="text-5xl" />
                    <h2 className="text-2xl font-bold">Add A Task</h2>
                </div>
            </Card>

            {modalOpen && (
                <div className="fixed justify-center mx-auto top-32 z-50 right-0 left-0 bottom-32 rounded-xl w-[300px] md:w-[450px] lg:w-[600px] h-auto flex flex-col text-center ">
                    <Card className="bg-teal-100 ">
                        <form onSubmit={handleSubmit}>
                            <TextInput
                                className="mb-5"
                                type="text"
                                placeholder="Task Title"
                                name="title"
                                value={newTask.title}
                                onChange={handleInputChange}
                                required
                            />

                            <Textarea
                                rows={5}
                                type="text"
                                placeholder="Task Description"
                                name="description"
                                value={newTask.description}
                                onChange={handleInputChange}
                            />

                            <Button type="submit" className="flex w-1/2 justify-center mx-auto bottom-0 mt-5">
                                Add
                            </Button>
                        </form>

                        <button className="flex text-5xl justify-center bottom-0" onClick={handleCloseModal}>
                            <BiX />
                        </button>
                    </Card>
                </div>
            )}

            {updateModalOpen && (
                <div className="fixed justify-center mx-auto top-32 z-50 right-0 left-0 bottom-32 rounded-xl w-[300px] md:w-[450px] lg:w-[600px] h-auto flex flex-col text-center">
                    <Card className="bg-stone-300">
                        <form onSubmit={handleUpdateSubmit}>
                            <TextInput
                                className="mb-5"
                                type="text"
                                placeholder="Update Task Title"
                                name="title"
                                value={newTask.title || selectedTask?.title || ""}
                                onChange={handleInputChange}
                                required
                            />

                            <Textarea
                                rows={5}
                                type="text"
                                placeholder="Update Task Description"
                                name="description"
                                value={newTask.description || selectedTask?.description || ""}
                                onChange={handleInputChange}
                            />

                            <Button type="submit" className="flex w-1/2 justify-center mx-auto bottom-0 mt-5">
                                Update
                            </Button>
                        </form>

                        <button className="flex text-5xl justify-center bottom-0" onClick={handleCloseUpdateModal}>
                            <BiX />
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AllDataCard;