const express = require('express')
const path = require('path')
const mysql = require('mysql2')
const bodyParser = require('body-parser');
const _ = require('lodash');

const { copyFileSync } = require('fs');

const urlencodedParser = bodyParser.urlencoded({ extended: false })  

const app = express()

app.listen(3000,() => {
    console.log('App running on port 3000')
})

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gaurav#29',
    database: 'mess_management_system'
})

app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'))
})

app.get('/display', (req, res) => {
    res.render('display', {
        columns: '', 
        tuples: '',
        name:''
    })
})

app.get('/display/query',(req,res)=>{
    const table = req.query.table
    console.log(table)
    connection.query('select * from ' + table , (err, rows, fields) => {
        console.log(rows)
        res.render('display', {
            columns: fields, 
            tuples: rows,
            name: table.toLocaleUpperCase()
        })
    })
})

app.get('/insert',(req,res)=>{
    res.render('insert',{
        columns: '',
        tuples:'',
        name:''
    })
})

app.get('/insert/query',(req,res)=>{
    const table = req.query.table
    console.log(table)
    connection.query('select * from ' + table , (err, rows, fields) => {
        console.log(rows)
        res.render('insert', {
            columns: fields,
            tuples: rows,
            name: table.toLocaleUpperCase()
        })
    })
})

app.get('/delete',(req,res)=>{
    res.render('delete',{
        columns: '',
        tuples:'',
        name:''
    })
})

app.get('/delete/query',(req,res)=>{
    const table = req.query.table
    console.log(table)
    connection.query('select * from ' + table , (err, rows, fields) => {
        console.log(rows)
        res.render('delete', {
            columns: fields,
            tuples: rows,
            name: table.toLocaleUpperCase()
        })
    })
})

app.post('/delete/table',urlencodedParser,(req,res)=>{
    const table = req.query.name
    let query = 'delete from '+ table+ ' where '
    for(let attr in req.body){
        query += attr+' = \''+ req.body[attr]+'\''
    }
    console.log(query)
    connection.query(query,(err,rows,fields)=>{
        console.log(rows)
        if(err){
            console.log(err)
        }
        res.redirect('/display/query?table='+table)
    })
    console.log(req.body)
    console.log(req.query)
    
})

app.get('/search',(req,res)=>{
    res.render('search',{
        columns: '',
        tuples:'',
        name:'',
        attribute:'',
        excol: '',
        extup:''
    })
})

app.post('/search/query', urlencodedParser,(req,res)=>{
    const table = req.query.table
    console.log(table)
    // console.log(req)
    console.log(req.query)
    console.log(req.body)
    if (req.query.attribute === 'none') {
        connection.query('select * from ' + table , (err, rows, fields) => {
            // console.log(rows)
            res.render('search', {
                columns: fields,
                tuples: rows,
                name: table.toLocaleUpperCase(),
                attribute:req.body.field,
                excol: '',
                extup:''
            })
        })
    } else {
        connection.query('select * from ' + table , (err, rows, fields) => {
            // console.log(rows)
            connection.query('select * from '+ table+' where '+req.query.attribute+' = \'' + req.body.value + '\'', (er,r,f)=>{
                
                res.render('search', {
                    columns: fields,
                    tuples: rows,
                    name: table.toLocaleUpperCase(),
                    attribute:'',
                    excol: f,
                    extup:r
                })
            }) 
            
        })
}
})

app.post('/insert/table', urlencodedParser,(req, res) => {
    console.log('body : ',req.body)
    let table = req.query.name
    let tuple = req.body
    let query = 'insert into '+ table+ ' ('
    for(let attribute in req.body){
        query += attribute+','
    }
    query = query.slice(0,query.length-1)
    query += ') values ('
    for(let attribute in req.body){
        query += '?,'
    }
    query = query.slice(0,query.length-1)
    query += ')'
    console.log(query)
    connection.query('desc '+table, (err,rows, fields)=>{
        let insert = [] 
        for(let i = 0; i<rows.length;i++){
            const type = rows[i].Type.toString().slice(0,3).toString()
            if(type==='int'){
                if(isNaN(parseInt(tuple[rows[i].Field])))
                    insert.push(null)
                else
                    insert.push(parseInt(tuple[rows[i].Field]))
            }
            else if(type=='dat')
            {
                if(tuple[rows[i].Field]==='')
                    insert.push(null)
                else
                insert.push(tuple[rows[i].Field])
            }
            else
                insert.push(tuple[rows[i].Field])
        }
        console.log(insert)
        connection.query(query,insert,(err,rows,fields)=>{
            if(err){
                console.log(err.message)
                console.log(err)
                let error = err.message.toString().split(' ')
                if(error[0]==='Duplicate'){
                    res.send('Duplicate Insertion')
                }
                else{
                    res.send('Some Error')
                }
            }
            else{
                // res.send('Data Inserted')
                res.redirect('/display/query?table='+table)
            }
        })
    })

    
})

app.get('/search/query',(req,res)=>{
    const table = req.query.table
    console.log(table)
    connection.query('select * from ' + table , (err, rows, fields) => {
        console.log(rows)

        res.render('search', {
                columns: fields,
                tuples: rows,
                name: table.toLocaleUpperCase(),
                attribute:'',
                excol: '',
                extup:''
            })

    })
})



app.get('/update',(req,res)=>{
    res.render('update',{
        columns: '',
        tuples:'',
        name:'',
        attr:''
    })
})

app.get('/update/query',(req,res)=>{
    const table = req.query.table
    console.log(table)
    connection.query('select * from ' + table , (err, rows, fields) => {
        console.log(rows)
        res.render('update', {
            columns: fields,
            tuples: rows,
            name: table.toLocaleUpperCase(),
            attr:''
        })
    })
})

app.post('/update/table', urlencodedParser,(req,res)=>{
    const table = req.query.name
    const {attr} = req.query
    const {field, attrval, keyval}=req.body
    console.log(table)
    if (attr === '') {
    connection.query('select * from ' + table , (err, rows, fields) => {
        console.log(rows)
        res.render('update', {
            columns: fields,
            tuples: rows,
            name: table.toLocaleUpperCase(),
            attr:field 
        })
    })
} else {
    let query = 'update ' + table + ' set ' + attr + ' = \'' +  attrval + '\' where '
    connection.query('select * from ' + table, (e, r, f) => {
        query += f[0].name + ' = \'' + keyval + '\''
        console.log(query)
        connection.query(query, (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.send('Some error while updating')
            } else {
                res.redirect('/display/query?table=' + table)
            }
        })
        // res.send('doing something')
    }) 
}
})

app.get('/adv',(req,res)=>{
    res.render('adv',{
        columns: '',
        tuples:'',
        name:'',
        attr:''
    })
})

app.get('/adv/query', urlencodedParser,(req,res)=>{
    // const table = req.query.table
    // console.log(table)
    // res.send('Hi')
    let query = req.query.q

    console.log(query)

    connection.query(query, (err) => {
        let type = query[0]+query[1]+query[2]
        if(err){
            // console.log('Error')
            let error = err.message.toString().split(' ')
                if(error[0]==='Duplicate'){
                    res.send('Duplicate Insertion')
                }
            else{
                res.send('Some Error Occured')
            }
            // console.log(err)
        }
        else{
            if(type==='ins')
            {
                res.send("Data Inserted Successfully") ;
                // let table = ''
                // for(let i=11; query.charAt(i)!='';i++){
                //     table += query.charAt(i)
                // }
                // res.redirect('/display/query?table=' + table)
            }
            else if(type=='del')
            {
                res.send("Data Deleted Successfully") ;
            }
            else{
                
            }
        }
    })

})
