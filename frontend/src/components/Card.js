const Card = ({title, icon, desc}) => {
    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition">
            <div>
                <img src={icon}></img> 
            </div>
            <div>
                <h4> {title} </h4>
                <p> {desc} </p>
            </div>
        </div>
    );
}

export default Card;