var protobuf = require('protocol-buffers')
var stable = require('stable')
var defined = require('defined')
var multihashing = require('multihashing') 
var base58 = require('bs58')
var multiline = require('multiline')

var schema = multiline(function() {/*
  message PBLink {
    optional bytes Hash = 1;
    optional string Name = 2;
    optional uint64 Tsize = 3;
  }
  message PBNode {
    repeated PBLink Links = 2;
    optional bytes Data = 1;
  }
*/})

var mdagpb = protobuf(schema)

exports = module.exports = {
  Node: Node,
  fromProtobuf: fromProtobuf,
}

function Node (data, links) {
  if (!(this instanceof Node)) return new Node(data, links)

  // convert links from Nodes to Links
  if (typeof links === 'object') {
    if (Array.isArray(links)) {
      this.links = links
    } else {
      this.links = Object.keys(links).map(function (name) {
        return new Link(name, links[name].size, links[name].hash)
      })
    }
  } else {
    this.links = []
  }

  this.data = data
  this.encoded = mdagpb.PBNode.encode(toProtoBuf(this))
  this.hash = multihashing(this.encoded, 'sha2-256')
  this.size = computeSize(this)
  this.multihash = base58.encode(this.hash)

  this.asLink = function (name) {
    return new Link(name, this.size, this.hash)
  }

  // A node's size is the total size of the data addressed by node, plus the
  // sum of the sizes of the nodes it links to.
  function computeSize (node) {
    if (!node.encoded) {
      throw new Error('no value for \'encoded\' -- this should not happen')
      return 0
    }
    var size = node.encoded.length
    for (var i = 0; i < node.links.length; i++) {
      size += node.links[i].size
    }
    return size
  }

  // Helper method to get a protobuf object equivalent
  function toProtoBuf (node) {
    var pbn = {}

    if (node.data && node.data.length > 0) {
      pbn.Data = node.data
    } else {
      pbn.Data = null
    }

    if (node.links.length > 0) {
      pbn.Links = []

      for (var i = 0; i < node.links.length; i++) {
        var link = node.links[i]
        pbn.Links.push({
          Hash: link.hash,
          Name: link.name,
          Tsize: link.size
        })
      }
    } else {
      pbn.Links = null
    }

    return pbn
  }

  function fromProtobuf (data) {
    // extract struct from protobuf
    var pbn = mdagpb.PBNode.decode(data)

    // extract and sort links
    var links = []
    for (var i = 0; i < pbn.Links.length; i++) {
      var link = pbn.Links[i]
      var lnk = new Link(link.Name, link.Tsize, link.Hash)
      links.push(lnk)
    }
    stable.inplace(links, linkSort)

    var innerData = defined(pbn.Data, new Buffer(0))

    return new Node(innerData, links)

    function linkSort (a, b) {
      return a.name.localeCompare(b.name)
    }
  }
}

// Link represents a directional connection from one IPFS Merkle DAG Node to another.
function Link (name, size, hash) {
  this.name = name
  this.size = size
  this.hash = hash
}
