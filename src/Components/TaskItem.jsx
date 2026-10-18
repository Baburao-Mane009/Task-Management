import Button from "./Button.jsx";

function TaskItem({ task, onComplete, onDelete, onUpdate }) {
    return (
        <div className="task-item">
            <h2>{task.task}</h2>

            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
            

            <div className="task-actions">
                <Button
                    variant="delete"
                    onClick={() => onDelete(task._id)}
                >
                    Delete
                </Button>

                <Button
                    variant="complete"
                    onClick={() => onComplete(task._id)}
                >
                    {task.status === "pending" ? "Complete" : "Undo"}
                </Button>

                <Button
                    variant="edit"
                    onClick={() => onUpdate(task)}
                >
                    Edit
                </Button>
            </div>
        </div>
    );
}

export default TaskItem;