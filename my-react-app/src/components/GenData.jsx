export default function GenData({sendDataToParent, index}) {
    const handleChange = (e) => {
        const {id, value } = e.target;
        sendDataToParent(id, value, index);
    };

    return (
            <div className="row">
                <div className="col-sm-4">
                    <div className="form-group">
                        <input type="text" id="field1" key={index} className="form-control form-control-sm" onChange={handleChange} />
                    </div>
                </div>
                <div className="col-sm-2">
                    <div className="form-group">
                        <input type="text" id="field2" className="form-control form-control-sm" onChange={handleChange} />
                    </div>
                </div>
                <div className="col-sm-2">
                    <div className="form-group">
                        <input type="text" id="field3" className="form-control form-control-sm" onChange={handleChange} />
                    </div>
                </div>
                <div className="col-sm-2">
                    <div className="form-group">
                        <input type="text" id="field4" className="form-control form-control-sm" onChange={handleChange} />
                    </div>
                </div>
                <div className="col-sm-2">
                    <div className="form-group">
                        <input type="text" id="field5" className="form-control form-control-sm" onChange={handleChange} />
                    </div>
                </div>
            </div>
    );
}