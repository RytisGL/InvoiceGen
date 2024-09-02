import * as React from "react";

export default function InvoiceOutputHeader() {

    return (
            <div className="d-flex w-100" style={{background:"#6482AD", color:"white"}}>
                <div className="col-3"><h4>Serial</h4></div>
                <div className="col-4"><h4>Company Name</h4></div>
                <div className="col-3"><h4>Issue Date</h4></div>
                <div className="col-2"><h4>Sum</h4></div>
            </div>
    );
}