import { getAdminStats } from '../actions'
import { el, textNode } from '../js/element'
const secretInput = document.querySelector('#secret-input') as HTMLInputElement
const secretButton = document.querySelector("#auth-submit") as HTMLButtonElement

function auth(){
    const secret = secretInput.value
    getAdminStats(secret).then(stats => {
        document.querySelector('.admin-auth').classList.add('hide')
        document.querySelector('.admin-table').classList.remove('hide')
        const collections = ['Boards', 'Notes', 'Visits']
        const tbody = document.querySelector('tbody')
        for (let col of collections) {
            const tdTot = el("td", "", {}, textNode(`${stats[`total${col}`]} ${col}`))
            const tdAvg = el("td", "", {}, textNode(`${stats[`average${col}`]}/day`))
            const tdCol = el("td", "", {}, textNode(col))
            const tr = el("tr", "", {}, tdCol, tdAvg, tdTot)
            tbody.appendChild(tr)
        }
    }).catch(console.error)
}

secretButton.addEventListener("click", auth)