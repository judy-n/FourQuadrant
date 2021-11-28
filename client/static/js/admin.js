function auth(){
    const secret = document.querySelector('#secret-input').value
    getAdminStats(secret).then(stats => {
        document.querySelector('.admin-auth').classList.add('hide')
        document.querySelector('.admin-table').classList.remove('hide')
        const collections = ['Boards', 'Notes', 'Visits']
        const tbody = document.querySelector('tbody')
        for (let col of collections) {
            const tr = document.createElement('tr')
            const tdCol = document.createElement('td')
            const tdAvg = document.createElement('td')
            const tdTot = document.createElement('td')
            tdCol.appendChild(document.createTextNode(col))
            tdAvg.appendChild(document.createTextNode(`${stats[`average${col}`]}/day`))
            tdTot.appendChild(document.createTextNode(`${stats[`total${col}`]} ${col}`))
            tr.appendChild(tdCol)
            tr.appendChild(tdAvg)
            tr.appendChild(tdTot)
            tbody.appendChild(tr)
        }
    })
}