const Card = ({title, icon, desc}) => {
    return (
        <div className="w-72 flex flex-col items-center p-4 rounded-lg shadow hover:shadow-md transition bg-[var(--brand-100)]">
            <div>
                <img src={icon}></img> 
            </div>
            <div>
                <h4 className="text-[var(--brand-900)] font-extrabold"> {title} </h4>
                <p className="text-[var(--brand-700)]"> {desc} </p>
            </div>
        </div>
    );
}

export default Card;