import { useState } from "react";


const Home = () =>
{
    const [attributes, setAttributes] = useState([])
    const [data, setData] = useState(null)

    const handleMouseClickEntity = (event) =>
    {
        if (!data)
            return

        const button = document.querySelector("#ID")
        button.innerHTML += `<br /> +${data.name}: ${data.data_type}`
        return
    }

    function addToSideNav(object)
    {
        if (!object)
        {
            console.log("Object is null")
            return
        }


        if (!object.name || !object.inference || !object.data_type)
            return

        const sideNav = document.querySelector(".sidenav")
        sideNav.innerHTML += `<p> <b>Name</b>: ${object.name} <br /> <b>Inference</b>: ${object.inference} <br /> <b>Data type</b>: ${object.data_type} <br /> 
                                <button class=btn>Add</button>
                                <button>Remove</button>
                              </p>`

        let buttons = document.querySelectorAll(".btn")
        buttons.forEach((button) => {button.onclick = (event) => handleMouseClickEntity(event)})

    }

    const handleMouseClickHome = (event) =>
    {
        const buttonInnerHTML = event.target.innerHTML
        if (buttonInnerHTML === "+Relationships")
        {
            fetch("http://127.0.0.1:5000/?entity1=e&user_choice=a&domain_description=")
            .then(response => response.json())
            .then(data => 
                {
                    setData(data)
                    console.log(data)
                    //addToSideNav(data)
                })
            .catch(error => console.log(error))
            return
        }

        const new_attribute = {
            name : "name",
            inference : "inference",
            data_type : "data type"
        }
        setAttributes(previousAttributes => {
            return [...previousAttributes, new_attribute]
        })

        if (false)
        {
            console.log(attributes)
        }

        //console.log(event.target.name)
        //setName(name + ' ' + event.target.name)

        const sideBar = document.querySelector(".sidenav")
        const attributesCount = 3

        for (let i = 0; i < attributesCount; i++)
        {
            //const id = "test" + i
            //sideBar.innerHTML += `<p> Name: name <br /> Inference: lorem ipsum lorem ipsum lorem ipsum lorem ipsum <br /> Data type: string <br /> Options: Relevant & Add | Relevat & Nothing  | Non-relevant & Add | Non-relevant & Nothing </p>`
            sideBar.innerHTML += `<p> <b>Name</b>: name <br /> <b>Inference</b>: lorem ipsum lorem ipsum lorem ipsum lorem ipsum <br /> <b>Data type</b>: string <br /> 
                                  <button class=btn>Add</button>
                                  <button>Remove</button>
                                  </p>`
        }

        let buttons = document.querySelectorAll(".btn")
        buttons.forEach((button) => {button.onclick = (event) => handleMouseClickEntity(event)})
    }


    return (
        <div>
            <div className="sidenav">
                <p> <b>Name</b>: name <br /> <b>Inference</b>: lorem ipsum lorem ipsum lorem ipsum lorem ipsum <br /> <b>Data type</b>: string <br /> 
                    <button className="btn" onClick={(event) => handleMouseClickEntity(event)}>Add</button>
                    <button>Remove</button>
                </p>
            </div>

            <div className="suggestion">
                <button className="propertiesButton" onClick={(event) => handleMouseClickHome(event)} name="Attributes">+Attributes</button>
                <button className="propertiesButton" onClick={(event) => handleMouseClickHome(event)} name="Relationships">+Relationships</button>
            </div>
            <button className="entityButton" id="ID" onClick={(event) => handleMouseClickEntity(event)}> Entity </button>
        </div>
    );
}

export default Home;