export default function InfoInputs({sendDataToParent, id, placeHldr}) {
    const handleChange = (e) => {
        const {id, value} = e.target;
        sendDataToParent(id, value);
    };

    return (
        <div className="form-group">
            <input
                type="text"
                className="form-control"
                id={id}
                placeholder={placeHldr}
                onChange={handleChange}
            />
        </div>
    );
}