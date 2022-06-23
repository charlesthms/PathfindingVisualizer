"use_strict";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const app = document.getElementById("app");

class Grid {

    #drag = false;
    #grabbed = false;
    #type = undefined;

    constructor(rows, columns, start = undefined, target = undefined){
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        this.start = start;
        this.target = target;

        this.generate();
    }

    generate(){
        const app = document.getElementById("app");
        const grid = document.querySelector(".grid");
        let cell;
        let row;
        let div;
        let overlay;


        app.style.setProperty("--grid-columns", this.columns);
        app.style.setProperty("--grid-rows", this.rows);
        app.style.setProperty("--cell-size", `${150 / this.columns}vmin`);

        for (let i = 0; i < this.rows; i++) {
            row = [];

            for (let j = 0; j < this.columns; j++) {
                div = document.createElement("div");
                overlay = document.createElement("div");
                overlay.setAttribute("class", "overlay");
                div.appendChild(overlay);
                cell = new Cell(j, i, div, false, this);
                grid.appendChild(div);
                row.push(cell);
            }

            this.grid.push(row);
        }

        this.addPoints();
        return this.grid;
    }

    addPoints(){
        this.start = this.grid[this.start ? this.start.y : 1][this.start ? this.start.x : 1];
        this.target = this.grid[this.target ? this.target.y : this.rows - 2][this.target ? this.target.x : this.columns - 2];
        this.start.div.classList.add("start");
        this.target.div.classList.add("target");
        this.addListenners();
    }

    addListenners(){
        app.addEventListener("mousedown", e => {
            if(e.target === this.start.div){
                this.#drag = false;
                this.#grabbed = true;   
                this.#type = "start";
            } else if(e.target === this.target.div){
                this.#drag = false;
                this.#grabbed = true;   
                this.#type = "target";
            } else {
                this.#drag = true;
            }
        });

        app.addEventListener("mouseup", e => {
            this.#drag = false;
            this.#grabbed = false;
            
            if(this.#type && this.#type == "start"){
                this.start = this.findCellFromDiv(e.target);
                this.start.removeWall();
                this.#type = undefined;
            } else if(this.#type && this.#type == "target"){
                this.target = this.findCellFromDiv(e.target);
                this.target.removeWall();
                this.#type = undefined;
            }
        });
    }

    reset(){

        document.querySelector(".bar_v").style.width = `0%`;
        document.querySelector(".num_v").innerHTML = "0";
        document.querySelector(".bar_p").style.width = `0%`;
        document.querySelector(".num_p").innerHTML = "0";

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let cell = this.grid[i][j];
                cell.reset();
                cell.removeWall();
            }
        }
    }

    clear(){

        document.querySelector(".bar_v").style.width = `0%`;
        document.querySelector(".num_v").innerHTML = "0";
        document.querySelector(".bar_p").style.width = `0%`;
        document.querySelector(".num_p").innerHTML = "0";

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let cell = this.grid[i][j];
                cell.reset();
            }
        }
    }

    findCellFromDiv(div){
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if(this.grid[i][j].div == div) return this.grid[i][j];
            }
        }
        return undefined;
    }

    drag(){
        return this.#drag;
    }

    grabbed(){
        return this.#grabbed;
    }

    type(){
        return this.#type;
    }

    start(){
        return this.start;
    }

    target(){
        return this.target;
    }
}

class Cell{

    constructor(x, y, div, isWall, grid){
        this.x = x;
        this.y = y;
        this.div = div;
        this.gridInstance = grid;
        this.grid = grid.grid;
        this.visited = false;
        this.isWall = isWall;
        this.kruskal = -1;

        this.gCost = Number.POSITIVE_INFINITY;
        this.hCost = 0;
        this.fCost = Number.POSITIVE_INFINITY;
        this.previous = undefined;

        this.draw();
        this.addListenners();
    }

    draw(){        
        this.div.classList.add("cell");
        if(this.isWall){
            this.div.classList.add("wall");
            this.isWall = !this.isWall;
        } else if ((this.x + this.y) % 2 == 0)
            this.div.classList.add("light");  
        else 
            this.div.classList.add("dark");
    }

    addListenners(){
        this.div.addEventListener("click", e => {
            if(this.gridInstance.start != this && this.gridInstance.target != this){
                this.div.classList.toggle("wall");
                this.isWall = !this.isWall;
            }
        });
        

        this.div.addEventListener("mouseover", e => {
            if(this.gridInstance.drag()){
                if(this.gridInstance.start != this && this.gridInstance.target != this){
                    this.div.classList.toggle("wall");
                    this.isWall = !this.isWall;
                }
            } else if(this.gridInstance.grabbed()){
                if(this.gridInstance.type() && this.gridInstance.type() == "start"){
                    this.div.classList.toggle("start");
                } else if(this.gridInstance.type() && this.gridInstance.type() == "target"){
                    this.div.classList.toggle("target");
                }
            }
        });

        this.div.addEventListener("mouseleave", e => {
            if(this.gridInstance.grabbed()){
                if(this.gridInstance.type() && this.gridInstance.type() == "start"){
                    this.div.classList.toggle("start");
                } else if(this.gridInstance.type() && this.gridInstance.type() == "target"){
                    this.div.classList.toggle("target");
                }
            }
        });

    }

    getNeightbours(distance){
        let neightbours = [];

        let top = this.y > 1 ? this.grid[this.y-distance][this.x] : undefined;
        let bottom = this.y < this.grid.length - distance ? this.grid[this.y+distance][this.x] : undefined;
        let left = this.x > 1 ? this.grid[this.y][this.x-distance] : undefined;
        let right = this.x < this.grid[this.y].length - distance ? this.grid[this.y][this.x + distance] : undefined;

        if (top && !top.visited) neightbours.push(top);
        if (bottom && !bottom.visited) neightbours.push(bottom);
        if (left && !left.visited) neightbours.push(left);
        if (right && !right.visited) neightbours.push(right);

        return neightbours;
    }

    removeWall(){
        this.div.classList.remove("wall");
        this.isWall = false;
    }

    addWall(){
        this.div.classList.add("wall");
        this.isWall = true;
    }

    reset(){
        this.visited = false;
        this.div.firstChild.classList.remove("pathAnimation");
        this.div.firstChild.classList.remove("openAnimation");
        this.gCost = Number.POSITIVE_INFINITY;
        this.hCost = 0;
        this.fCost = Number.POSITIVE_INFINITY;
        this.previous = undefined;
    }

    getConnectedNeightbours(diagonales = false){
        let neightbours = [];

        if(diagonales){
            for (let i = this.y-1; i <= this.y+1; i++) {
                for (let j = this.x-1; j <= this.x+1; j++) {
                    if(i>=0 && i<this.grid.length-1 && j>=0 && j<this.grid[i].length-1 && (this.grid[i][j] != this) && !this.grid[i][j].isWall) 
                        neightbours.push(this.grid[i][j]);
                }
            } 
        } else {
            let top = this.y > 0 ? this.grid[this.y - 1][this.x] : undefined;
            let bottom = this.y < this.grid.length - 1 ? this.grid[this.y + 1][this.x] : undefined;
            let left = this.x > 0 ? this.grid[this.y][this.x - 1] : undefined;
            let right = this.x < this.grid[this.y].length - 1 ? this.grid[this.y][this.x + 1] : undefined;

            if (top && !top.isWall) neightbours.push(top);
            if (bottom && !bottom.isWall) neightbours.push(bottom);
            if (left && !left.isWall) neightbours.push(left);
            if (right && !right.isWall) neightbours.push(right);
        }
        
        return neightbours;
    }

    incProgress(){
        const bar = document.querySelector('.bar');
        let v = parseInt(bar.style.width.replace(/\D/g, ''));
        bar.style.width = `${v+1}%`;
    }
}

// #####################################################

class Utils {
    #w = 39;
    #h = 71;
    maze = undefined;
    solver = undefined;

    algorithms = {
        "dijkstra": false,
        "astar": true,
        "breadthf": false,
        "jps": false
    };

    mazeGen = {
        "dfs": true,
        "prim": false,
        "rd": false,
        "kruskal": false
    };

    constructor(){
        this.grid = new Grid(this.#w, this.#h);
        this.enableDiags = false;
        this.enableAnims = true;
    
        this.visualize = document.getElementById("visu");
        this.clear = document.getElementById("clear");
        this.reset = document.getElementById("reset");
        this.gen = document.getElementById("gen");
        this.diags = document.getElementById("switch1");
        this.anims = document.getElementById("switch2");
        this.algos = document.querySelectorAll(".algos");
        this.mazegen = document.querySelectorAll(".mazegen");
        this.anims.checked = this.enableAnims;

        this.listeners();
    }

    async listeners(){
        this.diags.addEventListener("click", () => {
            this.enableDiags = !this.enableDiags;
        });
    
        this.anims.addEventListener("click", () => {
            this.enableAnims = !this.enableAnims;
        });
    
        this.visualize.addEventListener("click", async () => {
            this.startSelectedAlgorithm();
        });

        this.gen.addEventListener("click", async () => {
            this.startSelectedMaze();
        });
    
        this.clear.addEventListener("click", () => {
            this.grid.clear();
        });

        this.reset.addEventListener("click", () => {
            this.grid.reset();
        });

        this.algos.forEach(algo => {
            algo.addEventListener("click", e => {
                Object.keys(this.algorithms).forEach(key => {
                    this.algorithms[key] = false;
                });
                this.algorithms[algo.id] = true;
                this.addClass(algo, ".algos");
            });
        });

        this.mazegen.forEach(algo => {
            algo.addEventListener("click", e => {
                Object.keys(this.mazeGen).forEach(key => {
                    this.mazeGen[key] = false;
                });
                this.mazeGen[algo.id] = true;
                this.addClass(algo, ".mazegen");
            });
        });
    }

    addClass(el, divclass){
        document.querySelectorAll(divclass).forEach(algo => {
            algo.classList.remove("active");
        });
        el.classList.add("active");
    }

    async startSelectedMaze(){
        this.grid.reset();
        if(this.mazeGen["dfs"]){
            this.maze = new Maze(this.grid);
            await this.maze.rdf_draw();
        } else if(this.mazeGen["prim"]) {
            this.maze = new Maze(this.grid);
            await this.maze.prim_draw();
        } else if(this.mazeGen["rd"]){
            this.maze = new Maze(this.grid);
            await this.maze.rd_draw();
        } else if(this.mazeGen["kruskal"]){
            this.maze = new Maze(this.grid);
            await this.maze.kruskal_draw();
        }
    }

    startSelectedAlgorithm(){
        if(this.algorithms["dijkstra"]){
            this.grid.clear();
            this.solver = new Solver(this.grid, this.enableDiags, this.enableAnims);
            this.solver.start("dijkstra");
        } else if(this.algorithms["astar"]) {
            this.grid.clear();
            if (this.solver) {
                if(!this.solver.isRunning){
                    this.solver = new Solver(this.grid, this.enableDiags, this.enableAnims);
                    this.solver.start("astar");
                }
            } else {
                this.solver = new Solver(this.grid, this.enableDiags, this.enableAnims);
                this.solver.start("astar");
            }
        } else if(this.algorithms["breadthf"]){
            alert("Feature incoming ...");
        } else if(this.algorithms["jps"]){
            alert("Feature incoming ...");
        }
    }
}



// ##############################################################

            
new Utils();

// ################  TUTORIAL  #################################

const modal = document.getElementById("modal");
document.getElementById("modalBtn").addEventListener("click", () => {
    modal.classList.add("hide");
});


