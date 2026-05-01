import axios from "axios"
import { useEffect, useState } from "react"


function Example() {

    const [example, setExample] = useState<any>('')

    useEffect(() => {
        axios.get('http://localhost:3000/example').then((res) => {
            setExample(res.data)
        })
    }, [])
    return (
        <div>{example}</div>
    )
}

export default Example