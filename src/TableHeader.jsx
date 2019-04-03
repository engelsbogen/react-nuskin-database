import React from 'react';


function makeHeading(heading, index) {
    
    var head = <th key={index}>{heading}</th>;
    return head;
}

function TableHeader(props) {
   
    return ( <thead>
            <tr> 
              { props.headings.map( (t, i) => makeHeading(t,i) ) }
            </tr>
             </thead>
           );
}


function makeCell(o, index) {
    
    return <td key={index}>{o}</td>; 
}

function TableRow(props) {
    
    return ( <tr>
              { props.cells.map((t,i) => makeCell(t, i)) }
             </tr>
           );
    
}


export {TableHeader, TableRow };