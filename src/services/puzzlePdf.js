// adapted from https://crosswordnexus.com/js/puz_functions.js
// (c) 2016 Alex Boisvert
// licensed under MIT license
// https://opensource.org/licenses/MIT

// my additions
import jsPDF from 'jspdf';
const isAcrossClue = clue => clue.direction[1];
const isDownClue = clue => clue.direction[0];
const hasCircleAt = (data, pos) => data.extras.GEXT && (data.extras.GEXT[pos] & 0x80) === 0x80;


/** Draw a crossword grid (requires jsPDF) **/
function draw_crossword_grid(doc, puzdata, options) {
  var DEFAULT_OPTIONS = {
    grid_letters : true
    ,   grid_numbers : true
    ,   x0: 20
    ,   y0: 20
    ,   cell_size: 24
    ,   gray : 0.4
  };

  for (var key in DEFAULT_OPTIONS) {
    if (!DEFAULT_OPTIONS.hasOwnProperty(key)) continue;
    if (!options.hasOwnProperty(key))
    {
      options[key] = DEFAULT_OPTIONS[key];
    }
  }

  var PTS_TO_IN = 72;
  var cell_size = options.cell_size;

  /** Function to draw a square **/
  function draw_square(doc,x1,y1,cell_size,number,letter,filled,circle) {
    var filled_string = (filled ? 'F' : '');
    var number_offset = cell_size/20;
    var number_size = cell_size/3.5;
    //var letter_size = cell_size/1.5;
    var letter_length = letter.length;
    var letter_size = cell_size/(1.5 + 0.5 * (letter_length - 1));
    var letter_pct_down = 4/5;
    doc.setFillColor(options.gray.toString());
    doc.setDrawColor(options.gray.toString());
    // Create an unfilled square first
    console.log('rect', { x1, y1, cell_size });
    doc.rect(x1,y1,cell_size,cell_size);
    // doc.rect(x1,y1,cell_size,cell_size,filled_string);
    //numbers
    doc.setFontSize(number_size);
    doc.text(x1+number_offset,y1+number_size,number);

    // letters
    doc.setFontSize(letter_size);
    doc.text(x1+cell_size/2,y1+cell_size * letter_pct_down,letter,null,null,'center');

    // circles
    if (circle) {
      doc.circle(x1+cell_size/2,y1+cell_size/2,cell_size/2);
    }
  }

  var width = puzdata.width;
  var height = puzdata.height;
  for (var i=0; i<height; i++) {
    var y_pos = options.y0 + i * cell_size;
    for (var j=0; j<width; j++) {
      var x_pos = options.x0 + j * cell_size;
      var grid_index = j + i * width;
      var filled = false;

      /* don't print letters or numbers
      // Letters
      var letter = puzdata.solution.charAt(grid_index);
      if (letter == '.') {
        filled = true;
        letter = '';
      }
      // Numbers
      if (!options.grid_letters) {letter = '';}
      var number = puzdata.sqNbrs[grid_index];
      if (!options.grid_numbers) {number = '';}
       */
      var number = '';
      var letter = '';

      // Circle
      // changed to use diagramless puzzle data
      var circle = hasCircleAt(puzdata, grid_index);
      draw_square(doc,x_pos,y_pos,cell_size,number,letter,filled,circle);
    }
  }
}

/** Create a PDF (requires jsPDF) **/

export function puzdata_to_pdf(puzdata, options = {}) {
  var DEFAULT_OPTIONS = {
    margin: 20
    ,   title_pt: null
    ,   author_pt: null
    ,   copyright_pt: 8
    ,   num_columns : null
    ,   num_full_columns: null
    ,   column_padding: 10
    ,   gray: 0.55
    ,   under_title_spacing : 20
    ,   max_clue_pt : 14
    ,   min_clue_pt : 5
    ,   grid_padding : 5
    ,   outfile : null
  };

  for (var key in DEFAULT_OPTIONS) {
    if (!DEFAULT_OPTIONS.hasOwnProperty(key)) continue;
    if (!options.hasOwnProperty(key))
    {
      options[key] = DEFAULT_OPTIONS[key];
    }
  }

  // If there's no filename, just call it puz.pdf
  if (!options.outfile) options.outfile = 'puz.pdf';

  // If options.num_columns is null, we determine it ourselves
  if (!options.num_columns || !options.num_full_columns)
  {
    if (puzdata.height >= 17) {
      options.num_columns = 5;
      options.num_full_columns = 2;
    }
    else if (puzdata.width >= 17) {
      options.num_columns = 4;
      options.num_full_columns = 1;
    }
    else {
      options.num_columns = 3;
      options.num_full_columns = 1;
    }
  }

  // The maximum font size of title and author
  var max_title_author_pt = Math.max(options.title_pt,options.author_pt);

  var PTS_PER_IN = 72;
  var DOC_WIDTH = 8.5 * PTS_PER_IN;
  var DOC_HEIGHT = 11 * PTS_PER_IN;

  var margin = options.margin;

  var doc;


  // create the clue strings and clue arrays
  var across_clues = [];
  // adapted to use diagramless puzzle data
  puzdata.clues.filter(isAcrossClue).forEach((clue, i) => {
    var this_clue_string = clue.number + '. ' + clue.clue;
    if (i==0) {
      across_clues.push('ACROSS\n' + this_clue_string);
    }
    else {
      across_clues.push(this_clue_string);
    }
  });

  // For space between clue lists
  across_clues.push('');

  var down_clues = [];
  // adapted to use diagramless puzzle data
  puzdata.clues.filter(isDownClue).forEach((clue, i) => {
    var this_clue_string = clue.number + '. ' + clue.clue;
    if (i==0) {
      down_clues.push('DOWN\n' + this_clue_string);
    }
    else {
      down_clues.push(this_clue_string);
    }
  });

  // size of columns
  var col_width = (DOC_WIDTH - 2 * margin - (options.num_columns -1 ) * options.column_padding) / options.num_columns;

  // The grid is under all but the first few columns
  var grid_width = DOC_WIDTH - 2 * margin - options.num_full_columns * (col_width + options.column_padding);
  var grid_height = (grid_width / puzdata.width) * puzdata.height;
  // x and y position of grid
  var grid_xpos = DOC_WIDTH - margin - grid_width;
  var grid_ypos = DOC_HEIGHT - margin - grid_height - options.copyright_pt;

  // Loop through and write to PDF if we find a good fit
  // Find an appropriate font size
  var clue_pt = options.max_clue_pt;
  var finding_font = true;
  while (finding_font)
  {
    doc = new jsPDF('portrait','pt','letter');
    var clue_padding = clue_pt / 3;
    doc.setFontSize(clue_pt);

    // Print the clues
    var line_xpos = margin;
    var line_ypos = margin + max_title_author_pt + options.under_title_spacing + clue_pt + clue_padding;
    var my_column = 0;
    var clue_arrays = [across_clues, down_clues];
    for (var k=0; k<clue_arrays.length; k++) {
      var clues = clue_arrays[k];
      for (var i=0; i<clues.length; i++) {
        var clue = clues[i];
        // check to see if we need to wrap
        var max_line_ypos;
        if (my_column < options.num_full_columns) {
          max_line_ypos = DOC_HEIGHT - margin - options.copyright_pt;
        } else {
          max_line_ypos = grid_ypos - options.grid_padding;
        }

        // Split our clue
        var lines = doc.splitTextToSize(clue,col_width);

        if (line_ypos + (lines.length - 1) * (clue_pt + clue_padding) > max_line_ypos) {
          // move to new column
          my_column += 1;
          line_xpos = margin + my_column * (col_width + options.column_padding);
          line_ypos = margin + max_title_author_pt + options.under_title_spacing + clue_pt + clue_padding;
        }

        for (var j=0; j<lines.length; j++)
        {
          // Set the font to bold for the title
          if (i==0 && j==0) {
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFont('helvetica', 'normal');
          }
          var line = lines[j];
          // print the text
          doc.text(line_xpos,line_ypos,line);

          // set the y position for the next line
          line_ypos += clue_pt + clue_padding;
        }
      }
    }

    // let's not let the font get ridiculously tiny
    if (clue_pt == options.min_clue_pt)
    {
      finding_font = false;
    }
    else if (my_column > options.num_columns - 1)
    {
      clue_pt -= 0.1;
    }
    else
    {
      finding_font = false;
    }
  }


  /***********************/

  // If title_pt or author_pt are null, we determine them
  var DEFAULT_TITLE_PT = 12;
  var total_width = DOC_WIDTH - 2 * margin;
  if (!options.author_pt) options.author_pt = options.title_pt;
  if (!options.title_pt) {
    options.title_pt = DEFAULT_TITLE_PT;
    var finding_title_pt = true;
    while (finding_title_pt)
    {
      var title_author = puzdata.title + 'asdfasdf' + puzdata.author;
      doc.setFontSize(options.title_pt)
        .setFont('helvetica', 'bold');
      var lines = doc.splitTextToSize(title_author,DOC_WIDTH);
      if (lines.length == 1) {
        finding_title_pt = false;
      }
      else {
        options.title_pt -= 1;
      }
    }
    options.author_pt = options.title_pt;
  }



  /* Render title and author */

  var title_xpos = margin;
  var author_xpos = DOC_WIDTH - margin;
  var title_author_ypos = margin + max_title_author_pt;
  //title
  doc.setFontSize(options.title_pt);
  doc.setFont('helvetica', 'bold');
  doc.text(title_xpos,title_author_ypos,puzdata.title);

  //author
  doc.setFontSize(options.author_pt);
  doc.text(author_xpos,title_author_ypos,puzdata.author,null,null,'right');
  doc.setFont('helvetica', 'normal');

  /* Render copyright */
  var copyright_xpos = DOC_WIDTH - margin;
  var copyright_ypos = DOC_HEIGHT - margin;
  doc.setFontSize(options.copyright_pt);
  doc.text(copyright_xpos,copyright_ypos,puzdata.copyright,null,null,'right');

  /* Draw grid */

  var grid_options = {
    grid_letters : false
    ,   grid_numbers : true
    ,   x0: grid_xpos
    ,   y0: grid_ypos
    ,   cell_size: grid_width / puzdata.width
    ,   gray : options.gray
  };
  draw_crossword_grid(doc,puzdata,grid_options);

  doc.save(options.outfile);
}
