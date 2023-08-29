import { Line, Fork, Bend, Gap, Data, New, End, Null } from "./treeblocks.js";

export default class Schema
{
    constructor(textArea)
    {
        this.real = new RealBuffer(textArea);

        textArea.addEventListener("keydown", (event) => {this.real.keyHandler(event)});
    }
}

export class Tree
{
    constructor()
    {
        this.nodes = new Array();
    }

    push(line)
    {
        var level = getNumTabs(line);
        var data = removeTabs(line);

        this.nodes.push(new Node(data, level));

        console.log(this);

        
        function removeTabs(input)
        {
            return input.replaceAll(/\t/g, "");
        }

        function getNumTabs(input)
        {
            var count = line.match(/^\t*(\t)/gm);
            if(count != null)
            {
                count = count[0].length;
            }
            else
            {
                count = 0;
            }
            return count;
        }
    }

    format()
    {
        var mainArr = new Array();
        for(var node of this.nodes)
        {
            var holder = new Array();
            for(var i = 0; i < node.level; i++)
            {
                holder.push(new New());
            }
            if(node.value == "")
            {
                holder.push(new End());
            }
            else
            {
                holder.push(new Data(node.value));
            }
            mainArr.push(holder);
        }

        for(var i = 0; i < mainArr.length; i++)
        {
            var previous = null;
            if(i > 0)
            {
                previous = mainArr[i-1];
            }

            var next = null;
            if(i < mainArr.length)
            {
                next = mainArr[i+1];
            }
        }
        /**

        for(var row = 0; row < mainArr.length; row++)
        {
            for(var col = 0; col < mainArr[row].length; col++)
            {
                if((right(row, col, mainArr).type != "Data" && right(row, col, mainArr).type != "End") && mainArr[row][col].type != "Data")
                {
                    mainArr[row][col] = new Line();
                }
            }
        }

        for(var row = 0; row < mainArr.length; row++)
        {
            for(var col = 0; col < mainArr[row].length; col++)
            {
                if((right(row, col, mainArr).type != "Data" && (down(row, col, mainArr).type == "Data" || down(row, col, mainArr).type == "Gap" || down(row, col, mainArr).type == null))&& mainArr[row][col].type != "Data")
                {
                    mainArr[row][col] = new Gap();
                }
            }
        }
       
        */

        console.log(mainArr);



        function right(row,index,mainArr)
        {
            if(mainArr.length - 1 < row)
            {
                return new Null();
            }
            if(mainArr[row].length - 1 <= index)
            {
                return new Null();
            }
            return mainArr[row][index+1].type;
        }

        function down(row, index, mainArr)
        {
            if(row + 1 >= mainArr.length)
            {
                return new Null();
            }
            if(mainArr[row].length - 1 < index)
            {
                return new Null();
            }
            return mainArr[row+1][index].type;
        }
    }


}

class Node
{
    constructor(value, level)
    {
        this.value = value;
        this.level = level;
    }
}

class RealBuffer
{
    constructor(textArea)
    {
        this.ref = textArea;
        this.start = textArea.selectionStart;
        this.end = textArea.selectionEnd;
        this.raw = new RawBuffer(this);
        this.exe = new ExecutiveBuffer(this);
        this.state = "UNLOCKED";
    }

    write(vb)
    {
        this.ref.value = vb.value;
    }

    writeCarrat()
    {
        this.ref.selectionStart = this.start;
        this.ref.selectionEnd = this.end;
    }

    readCarrat()
    {
        this.start = this.ref.selectionStart;
        this.end = this.ref.selectionEnd;
    }

    moveCarrat(vector)
    {
        this.start += vector;
        this.end += vector;
        this.writeCarrat();
    }


    keyHandler(event)
    {
        if(this.state == "LOCKED")
        {
            setTimeout(() => {this.keyHandler(event)}, 10);
            return;
        } 
        this.readCarrat();
        this.write(this.raw);
        this.writeCarrat();

        if(event.key == "Tab")
        {
            event.preventDefault();
            this.ref.value = this.ref.value.substring(0,this.start) + "\t" + this.ref.value.substring(this.end);
            this.moveCarrat(1);
        }

        this.state = "LOCKED";
        setTimeout(() => {this.display()}, 10);
    }

    display()
    {
        this.raw.update();
        this.exe.update();
        this.readCarrat();
        this.write(this.exe);
        this.writeCarrat();
        console.log(this);
        this.state = "UNLOCKED";
    }
}

class VirtualBuffer
{
    constructor(realBuffer, color)
    {
        this.ref = realBuffer.ref;
        this.value = "";
        this.start = this.ref.selectionStart;
        this.end = this.ref.selectionEnd;
        this.color = color;
    }

    update()
    {
        this.value = this.ref.value.slice();
        this.ref.style.color = this.color;
        this.start = this.ref.selectionStart;
        this.end = this.ref.selectionEnd;
    }
}

class RawBuffer extends VirtualBuffer
{
    constructor(realBuffer)
    {
        super(realBuffer, "red");
    }

    update()
    {
        super.update();
        
    }
}

class ExecutiveBuffer extends VirtualBuffer
{
    constructor(realBuffer)
    {
        super(realBuffer, "blue");
        this.tree = new Tree();
    }

    update()
    {
        super.update();
        this.value = this.convert(this.value);
        
    }

    convert(input)
    {
        this.tree = new Tree();
        var lines = input.split("\n");
        for(var line of lines)
        {
            this.tree.push(line);
        }

        console.log(this.tree);

        this.tree.format();

        return input;
    }
}



