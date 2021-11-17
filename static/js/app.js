function init() {
  d3.json("/data/samples.json").then(function (json_data) {
    let data = json_data;
    // Taking a first look of the complete data set.
    console.log("The complete data set:")
    console.log(data);

    //Pulling the names, which are used for the drop-down menu and selection of datasets.
    let data_names = data.names;
    var dropDownMenu = d3.select("#selDataset");

    //Go through each name in the data set and add them to the drop-down menu.
    data_names.forEach(function (name) {
      dropDownMenu.append("option").text(name).property("value", name);
    });

    //As a default so the page is pre-populated, we'll start with the top of the data.
    let subjectID = data_names[0];

    select_subject(subjectID);
    meta_table(subjectID)
  });
}

//This function will do most of the heavy lifting.
//Filtering the current test subject. Pulling the names and values of the bacteria found.
//Create both the horizontal bar graph and bubble graph to display the information.
function select_subject(subjectID) {
  d3.json("/data/samples.json").then(function (json_data) {
    console.log("Collecting data on the specficic test subject:");
    let data = json_data;  
    
    //Filtering to select the indicated suject from the drop down menu.
    let current_subject = data.samples.filter(sample => sample.id == subjectID);

    //console.log(current_subject);
    //Changing it from a list of values, to just the only one being selected.
    var current_subject_data = current_subject[0];
    console.log(current_subject_data);

    //Grabbing the necessary values for the overview graph.
    //Starting with OTU's found in the test subject with their labels.
    let otu_ids = current_subject_data.otu_ids;
    console.log(`The top 10 found were: ${otu_ids.slice(0,10)}`)
    let otu_labels = current_subject_data.otu_labels;
    console.log(`The their labels were: ${otu_labels.slice(0,10)}`)

    //Grabbing the sample values to populate the graph.
    let sample_values = current_subject_data.sample_values;
   
    //Creating the horizontal bar chart to display top 10 OTU's found.
    //All of these are reversed to show biggest values. Then sliced to only show top 10.
    
    //Creating the labels for the chart. 
    var y_ticks = otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse();
   
    var graph_data = [
      {
        y: y_ticks,
        x: sample_values.slice(0, 10).reverse(),
        text: otu_labels.slice(0, 10).reverse(),
        type: "bar",
        orientation: "h",
      }
    ];

    //Defining the layout and a title.
    var layout = {
      title: `Top 10 OTU Bacteria Found in Subject ${subjectID}`,
      xaxis: { title: "FREQUENCY" }
    };

    Plotly.newPlot("bar", graph_data, layout);

    //Creating the fancy looking bubble chart to display the data.
    //Following the appearance of from the sample HW images.
    var bubble_data = [
      {
        x: otu_ids,
        y: sample_values,
        text: otu_labels,
        mode: "markers",
        marker: {
          size: sample_values,
          color: otu_ids,
          colorscale: "Earth"
        }
      }
      ];
      
      //Defining the layout and a title (following example).
      var bubble_layout = {
        title: `Bacteria Cultures Found in Subject ${subjectID}`,
        xaxis: { title: "OTU ID #" },
      };
      Plotly.newPlot("bubble", bubble_data, bubble_layout);
  });
}

function meta_table(subjectID) {
  d3.json("/data/samples.json").then(function (json_data) {
    let data = json_data

    //This time we specifically just want only the meta data part of the test subjects.
    var metadata = data.metadata
    //Filtering to only select the current test subject.
    let meta_subject = metadata.filter(sample => sample.id == subjectID);
    //Pulling the information out of the obeject.
    var current_meta = meta_subject[0]
    //Previewing the metadeta.
    console.log("The current test subject's metadata is:")
    console.log(current_meta)
    //Pulling and previewing the keys & values for the metadata of the subject.
    //Used to fill demographic info on html file.
    console.log("The keys are:")
    meta_keys = Object.keys(current_meta)
    console.log(meta_keys)
    console.log("With values:")
    meta_values = Object.values(current_meta)
    console.log(meta_values)

    //Selecting the table from the index to store the data.
    var info_table = d3.select("#sample-metadata");
    
    //Had to get help with this one. My table kept filling up with more and more data.
    //The previous test subject data needed to be cleared. This does that by blanking it before filling it each time.
    info_table.html("");

    //Iterating through the lists of keys and values and plugging them into demographics table.
    for (let i = 0; i<meta_keys.length; i++){
      info_table.append("h5").text(`${meta_keys[i].toUpperCase()} : ${meta_values[i]}`);
    };
});
}

//This function is called when the user changes the test subject from the dropdown menu.
function optionChanged(new_subjectID) {
  // Fetch new data each time a new sample is selected
  select_subject(new_subjectID)
  meta_table(new_subjectID) 
};

init();