class Maze {

    constructor(grid){
        this.grid = grid;
        this.stack = [];
        this.start = grid.start;
        this.end = grid.end;
    }

    async rdf_draw(){
        this.fillWall(this.grid.grid);
        await this.randomized_depth_first(this.grid.grid[1][1]);
    }

    async rd_draw(){
        this.enclose();
        await this.recursive_division(0, 0, this.grid.grid[0].length - 1, this.grid.grid.length - 1);
    }

    async prim_draw(){
        this.fillWall(this.grid.grid);
        this.prim();
    }

    kruskal_draw(){
        this.kruskal();
    }
    
    /**
     * Randomized Depth First Search algorithm
     * Recursive version with backtracking
     * 
     * @param current Initial cell
     * @returns 
     */
    async randomized_depth_first(current){
        let next;
        let neightbours = current.getNeightbours(2);
        current.visited = true;

        if(neightbours.length > 0){
            next = neightbours[this.randint(0, neightbours.length)];
            current.removeWall();
            this.grid.grid[(current.y + next.y) / 2][(current.x + next.x) / 2].removeWall();
            next.removeWall();

            this.stack.push(next);
        } else if(this.stack.length > 0) {
            // Backtracking
            next = this.stack.pop();
        }

        if (this.stack.length == 0) {
            console.log("[rDFS] Generation complete!");
            return;
        }
        
        await delay(10);
        await this.randomized_depth_first(next);
    }

    /**
     * Recursive division algorithm
     * 
     * @param x_min 
     * @param y_min 
     * @param x_max 
     * @param y_max 
     */
    async recursive_division(x_min, y_min, x_max, y_max){
        // Si la subdivision est + haute de large
        if (y_max - y_min > x_max - x_min){
            let x = this.randint(x_min + 1, x_max);
            let y = this.randint(y_min + 2, y_max - 1);

            if ((x - x_min) % 2 == 0) x += this.randint(0, 2) == 0 ? 1 : -1;
            if ((y - y_min) % 2 == 1) y += this.randint(0, 2) == 0 ? 1 : -1;

            for (let i = x_min + 1; i < x_max; i++){
                if (i != x){
                    this.grid.grid[y][i].addWall();
                    await delay(10);
                }
            }

            if (y - y_min > 2) this.recursive_division(x_min, y_min, x_max, y);
            if (y_max - y > 2) this.recursive_division(x_min, y, x_max, y_max);

        } else{
            let x = this.randint(x_min + 2, x_max - 1);
            let y = this.randint(y_min + 1, y_max);

            if ((x - x_min) % 2 == 1) x += this.randint(0, 2) == 0 ? 1 : -1;
            if ((y - y_min) % 2 == 0) y += this.randint(0, 2) == 0 ? 1 : -1;

            for (let i = y_min + 1; i < y_max; i++){
                if (i != y){
                    this.grid.grid[i][x].addWall();
                    await delay(10);
                }
            }

            if (x - x_min > 2) this.recursive_division(x_min, y_min, x, y_max);
            if (x_max - x > 2) this.recursive_division(x, y_min, x_max, y_max);
        }
    }

    /**
     * Prim's algorithm
     */
    async prim(){
        let first = this.grid.grid[1][1];
        let walls = [];
        let neightbours = first.getNeightbours(1);
        first.visited = true;
        first.removeWall();

        for (let i = 0; i < neightbours.length; i++) {
            if(neightbours[i].y > 0 && neightbours[i].y < this.grid.grid.length - 1 && neightbours[i].x > 1 && neightbours[i].x < this.grid.grid[0].length - 1){
                walls.push(neightbours[i]);
            }
        }

        while(walls.length > 0){
            // Choix du voisin aléatoire
            let i = this.randint(0, walls.length);
            let wall = walls[i];
            walls.splice(i, 1);
            
            let pair;

            if(wall.y%2 == 0) pair = [this.grid.grid[wall.y-1][wall.x], this.grid.grid[wall.y+1][wall.x]];
            else pair = [this.grid.grid[wall.y][wall.x-1], this.grid.grid[wall.y][wall.x+1]];

            let new_cell;
            let valid;

            if(!pair[0].visited){
                new_cell = pair[0];
                valid= true;
            } else if(!pair[1].visited){
                new_cell = pair[1];
                valid=true;
            }

            if(valid){
                wall.removeWall();
                new_cell.removeWall();
                new_cell.visited = true;
                neightbours = new_cell.getNeightbours(1);

                for (let i = 0; i < neightbours.length; i++) {
                    if(neightbours[i].y > 0 && neightbours[i].y < this.grid.grid.length - 1 && neightbours[i].x > 0 && neightbours[i].x < this.grid.grid[0].length - 1){
                        walls.push(neightbours[i]);
                    }
                }
            }

            await delay(10);
        }
        console.log("[Prim] Complete!");
    }
    
    /**
     * Kruskal's algorithm randomized
     */
    async kruskal(){
        let grid = this.grid.grid;
        this.fillHoles(grid);
        let areaCount = 0;
        let walls = [];

        for (let i = 1; i < grid.length - 1; i++) {
            for (let j = 1; j < grid[i].length - 1; j++) {
                if(i % 2 == 1 && j % 2 == 1){
                    areaCount++;
                    grid[i][j].visited = true;
                    grid[i][j].kruskal = areaCount;
                }

                if((i+j) % 2 == 1) walls.push(grid[i][j]);
            }
        }

        while(walls.length > 0){
            let index = this.randint(0, walls.length - 1);
            let wall = walls[index];
            walls.splice(index, 1); 
            
            let c1;
            let c2;
            // Choix de la direction à prendre
            if(grid[wall.y - 1][wall.x].kruskal > -1){
                // Axe vertical
                c1 = grid[wall.y - 1][wall.x];
                c2 = grid[wall.y + 1][wall.x];
            } else {
                // Axe horizontal
                c1 = grid[wall.y][wall.x - 1];
                c2 = grid[wall.y][wall.x + 1]
            }

            if(c1.kruskal != c2.kruskal){
                // Merge
                for (let i = 1; i < grid.length - 1; i += 2){
					for (let j = 1; j < grid[0].length - 1; j += 2){
						if (grid[i][j].kruskal == c1.kruskal){
							grid[i][j].kruskal = c2.kruskal;
                        }
                    }
                }

                wall.removeWall();
            }
            await delay(10);
        }
       
        console.log("[Kruskal] Complete!");
    }

    merge(a, b){
        for (let i = b; i < b.length; i++){
            if(!this.contains(a, b[i])) a.push(b[i]);
        }
    }

    contains(tab, el){
        for (let i = 0; i < array.tab; i++) {
            if(tab[i] == el) return true;
        }
        return false;
    }

    enclose(){
        let tab = this.grid.grid;
        for (let i = 0; i < tab.length; i++) {
            tab[i][0].addWall();
            tab[i][tab[i].length - 1].addWall();
        }

        for (let j = 0; j < tab[0].length; j++) {
            tab[0][j].addWall();
            tab[tab.length - 1][j].addWall();
            
        }
    }

    fillHoles(grid){
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if(i % 2 == 0 || j % 2 == 0)
                    grid[i][j].addWall();
            }
        }
    }

    fillWall(grid){
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                grid[i][j].addWall();
            }
        }
    }

    randint(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}