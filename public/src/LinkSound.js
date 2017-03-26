import React, { Component } from 'react';
//import './linkSound.css';

class LinkSound extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
    this.props = {
      video_segments = [[0,6,"213"],[6,9,"264"]]
    }
  }

  shift_indexes(start_index, amount){
    for(var i = start_index; i < video_segments.length; i++){
      video_segments[i][0] += amount;
      video_segments[i][1] += amount;
    }
  }

  delete_range(first, last){
    var diff = last-first;
    for(var i = 0 ; i < video_segments.length; i++){
      var idx1 = video_segments[i][0];
      var idx2 = video_segments[i][1];
      if(first >= idx1 && last < idx2){
        if(first == idx1){
          if(diff == idx2 - idx1){
            //this catches the case where the entire deletion makes up the entire segment
          }else{
            video_segments[i][1] = idx2 - diff;
          }
        }else{
          video_segments[i][1] = idx2 - diff;
          //delete the current range and proceed to shift everything left by n characters
        }
        shift_indexes(i+1, diff);
      }
    }
    console.log(video_segments);
  }

  add_range(first, last, video){
    if(first == video_segments.length){//we are appending the new video clip to the end of the document
      video_segments.push([first,last,video]);
    }else{
      for(var i = 0 ; i < video_segments.length; i++){
        var idx1 = video_segments[i][0];
        var idx2 = video_segments[i][1];
        if(first >= idx1 && last < idx2){
          //this shrinks the first range and then pushes two extra ranges to. (effectively a split)
          video_segments[i][1] = first;
          video_segments.push([first,last,video]);
          video_segments.push([last,idx2 + 1,video_segments[i][2]]);
        }
      }
    }
  }

  //retrieve_deltas_and_derps()
  /*render() {
    if(this.props.editor === null) return null;
    const {editor} = this.props;
    let index = this.props.start;
    let lastTop = -10;
    let startIndexPosition = editor.getBounds(index, 0);
    let endIndexPosition = {...startIndexPosition};
    endIndexPosition.left += 10;
    if(editor.getSelection() !== null && editor.getSelection().index !== this.props.start){
      const endIndex = (this.props.end !== null ? this.props.end : editor.getSelection().index);
      endIndexPosition = editor.getBounds(endIndex, 0);
    }
    let lines = [];
    const textLength = editor.getLength();

    while(true){
      const firstPosition = editor.getBounds(index, 0);
      while(startIndexPosition.top <= lastTop && index < textLength){
        index++;
        startIndexPosition = editor.getBounds(index, 0);
      }
      lastTop = startIndexPosition.top;
      lines.push(<div key={"indicator-"+index} className={"indicator" + (this.props.end === null ? " current" : "")} style={{left: firstPosition.left + firstPosition.width, width: (firstPosition.top === endIndexPosition.top) ? (endIndexPosition.left - firstPosition.left):(editor.getBounds(index-1).left - firstPosition.left), top: firstPosition.top}} />);
      if(firstPosition.top >= endIndexPosition.top) break;

    }
    return <div>{lines}</div>;
  }*/
}

export default LinkSound;
