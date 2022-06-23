// ############################# A* #############################

class Solver {

    constructor(grid, enableDiags, enableAnims){
        this.gridInstance = grid;
        this.grid = grid.grid;
        this.enableAnims = enableAnims;
        this.enableDiags = enableDiags;
        this.open = [];
        this.closed = [];
        this.isRunning = false;
    }

    async start(algorithm){
        switch (algorithm) {
            case "dijkstra":
                await this.dijkstra();
                break;
            case "astar":
                await this.astar();
                break;
            default:
                console.error("No such algorithm '" + algorithm + "'");
                break;
        }
    }

    async dijkstra(){
        let current = this.gridInstance.start;
        current.gCost = 0;

        let unvisited = this.getUnvisited();

        while(unvisited.length > 0){
            let current = this.getLowestDist(unvisited);
            unvisited.splice(unvisited.indexOf(current), 1);
            let neightbours = current.getConnectedNeightbours();

            if(current === this.gridInstance.target){
                console.log("[Dijkstra] Path found!");
                this.reconstructPath(current);
                return;
            }
    
            for (let i = 0; i < neightbours.length; i++) {
                
                let _gCost = current.gCost + 1;

                if(_gCost < current.gCost){
                    let n = neightbours[i];
                    n.gCost = _gCost;
                    n.previous = current;
                }
            }
            current.div.firstChild.classList.add("openAnimation")
            await delay(10);
        }

    }

    /**
     * A* algorithm using Manathan heuristic
     * 
     * @returns 
     */
    async astar(){
        this.isRunning = true;
        this.entry = this.gridInstance.start;
        this.end = this.gridInstance.target;
        this.entry.hCost = this.heuristic(this.entry);
        this.entry.gCost = 0;
        this.entry.fCost = this.entry.gCost + this.entry.hCost;
        this.open.push(this.entry);

        let count = 0;
        
        while(this.open.length > 0){
            // Trouver la cellule avec le fCost le + faible dans la file ouverte
            let curr = this.findLowestFcost();

            this.open.splice(this.open.indexOf(curr), 1);
            this.closed.push(curr);

            if (curr === this.end) {
                // Fin de l'algo
                console.log("[A*] Path found!");
                this.reconstructPath(curr);
                this.isRunning = false;
                return;
            }
            
            // Trouver les voisins
            let neightbours = curr.getConnectedNeightbours(this.enableDiags);

            neightbours.forEach(neightbour => {
                if(this.closed.includes(neightbour)) return;

                count += 1;
                document.querySelector(".bar_v").style.width = `${count*100 / 5216}%`;
                document.querySelector(".num_v").innerHTML = count;

                let _gCost = curr.gCost + 1;

                if(_gCost < neightbour.gCost){
                    neightbour.gCost = _gCost;
                    neightbour.hCost = this.heuristic(neightbour)
                    neightbour.fCost = _gCost + this.heuristic(neightbour);
                    neightbour.previous = curr;

                    if(!this.open.includes(neightbour)) {
                        this.open.push(neightbour);
                    }
                }
            });

            if(this.enableAnims){
                this.open.forEach((cell, i) => cell.div.firstChild.classList.add("openAnimation"));
                await delay(10);
            } else {
                this.open.forEach(cell => cell.div.firstChild.classList.add("openAnimation"));
            }
        }

        return console.log("[A*] No path found.");
    }

    getLowestDist(lst){
        let lowest = lst[0];
        for (let i = 0; i < lst.length; i++) {
            if(lst[i].gCost < lowest.gCost){
                lowest = lst[i];
            }
        }
        return lowest;
    }

    getUnvisited(){
        let t = [];
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[0].length; j++) {
                if(!this.grid[i][j].isWall){
                    t.push(this.grid[i][j]);
                }
            }
        }
        return t;
    }

    findLowestFcost(){
        let i = 0;

        this.open.forEach((cell, index) => {
            if(cell.fCost < this.open[i].fCost) i = index;
        })

        return this.open[i];
    }

    heuristic(cell){
        let d1 = Math.abs(this.end.x - cell.x);
        let d2 = Math.abs(this.end.y - cell.y);

        return d1 + d2;
    }

    async reconstructPath(current){
        this.gridInstance.target.div.firstChild.setAttribute("class", "");
        let path = [];
        let count = 0;

        while (current.previous) {
            path.push(current)
            current = current.previous;
        }

        path.reverse()

        for (let i = 0; i < path.length - 1 ; i++) {
            let cell = path[i].div;

            count += 1;
            document.querySelector(".bar_p").style.width = `${count*100 / 5216}%`;
            document.querySelector(".num_p").innerHTML = count;

            //this.addNumbers(path[i]);
            cell.firstChild.setAttribute("class", "overlay");

            cell.firstChild.classList.add("pathAnimation");

            await delay(10);
        }

    }

    addNumbers(cell){
        let cellDiv = cell.div;
        let container = document.createElement("div");
        let consts = document.createElement("div");
        let g = document.createElement("p");
        let h = document.createElement("p");
        let d = document.createElement("p");

        container.setAttribute("class", "cell");
        consts.setAttribute("class", "consts");
        g.setAttribute("class", "g");
        h.setAttribute("class", "h");
        d.setAttribute("class", "d");

        g.innerText = cell.gCost;
        h.innerText = cell.hCost;
        d.innerText = cell.fCost;

        consts.appendChild(g);
        consts.appendChild(h);
        cellDiv.appendChild(consts);
        cellDiv.appendChild(d);
    }
}