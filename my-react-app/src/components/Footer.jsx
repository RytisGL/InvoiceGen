export default function Footer() {

    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">
                        <p>© {currentYear} To be changed</p>
                    </div>
                    <div className="col-sm-6">
                        <p>Contact: to@be.changed</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}