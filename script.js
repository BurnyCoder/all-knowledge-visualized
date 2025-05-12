document.addEventListener('DOMContentLoaded', () => {
    let allNodesData = {}; // To be populated from JSON

    // Function to initialize the graph and set up interactions
    function initializeGraph(nodesData) {
        allNodesData = nodesData; // Store loaded data globally for click handlers

        const initialNodeData = allNodesData['1']; // Assuming root node ID is '1'
        if (!initialNodeData) {
            console.error('Root node (ID 1) not found in loaded data.');
            return;
        }

        // Prepare a clean initial node for vis.js
        const initialVisNode = {
            id: initialNodeData.id,
            label: initialNodeData.label,
            title: initialNodeData.title,
            level: initialNodeData.level
        };

        const nodes = new vis.DataSet([initialVisNode]);
        const edges = new vis.DataSet([]);

        const container = document.getElementById('knowledgeGraph');
        const data = {
            nodes: nodes,
            edges: edges,
        };

        const options = {
            layout: {
                hierarchical: {
                    enabled: true,
                    levelSeparation: 150,
                    nodeSpacing: 150,
                    treeSpacing: 200,
                    direction: 'UD',
                    sortMethod: 'directed',
                },
            },
            interaction: {
                navigationButtons: true,
                keyboard: true,
                hover: true,
            },
            physics: {
                enabled: true,
            },
            nodes: {
                shape: 'box',
                margin: 10,
                widthConstraint: { minimum: 100, maximum: 200 },
                font: {
                    size: 14,
                    multi: 'html',
                },
                borderWidth: 1,
                shadow: true,
            },
            edges: {
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'vertical',
                    roundness: 0.4,
                },
                arrows: 'to',
                color: {
                    color: '#848484',
                    highlight: '#848484',
                    hover: '#848484',
                }
            },
        };

        const network = new vis.Network(container, data, options);

        network.on('click', function (params) {
            if (params.nodes.length > 0) {
                const clickedNodeId = params.nodes[0];
                // Ensure allNodesData is the one loaded from JSON
                const nodeData = allNodesData[clickedNodeId.toString()]; 

                if (nodeData && !nodeData.expanded && nodeData.childIds && nodeData.childIds.length > 0) {
                    const newNodesToAdd = [];
                    const newEdgesToAdd = [];

                    nodeData.childIds.forEach(childId => {
                        const childIdStr = childId.toString();
                        if (!nodes.get(childIdStr)) { // Check if node already exists
                            const childNodeDefinition = allNodesData[childIdStr];
                            if (childNodeDefinition) {
                                const visNode = { 
                                    id: childNodeDefinition.id, 
                                    label: childNodeDefinition.label, 
                                    title: childNodeDefinition.title, 
                                    level: childNodeDefinition.level 
                                };
                                newNodesToAdd.push(visNode);
                                newEdgesToAdd.push({ from: clickedNodeId, to: childNodeDefinition.id });
                            }
                        }
                    });

                    if (newNodesToAdd.length > 0) {
                        nodes.add(newNodesToAdd);
                    }
                    if (newEdgesToAdd.length > 0) {
                        edges.add(newEdgesToAdd);
                    }
                    
                    allNodesData[clickedNodeId.toString()].expanded = true; 
                }
            }
        });
    }

    // Fetch the external JSON data
    fetch('knowledge_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(jsonData => {
            initializeGraph(jsonData); // Initialize graph with fetched data
        })
        .catch(error => {
            console.error('Error fetching or parsing knowledge_data.json:', error);
            // Optionally, display an error message to the user in the UI
            const container = document.getElementById('knowledgeGraph');
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Failed to load knowledge graph data. Please check the console for errors.</p>';
            }
        });
}); 