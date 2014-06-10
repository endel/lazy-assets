module.exports = class Klass
  constructor: (name) ->
    @name = name
  shout: ->
    console.log("I'm alive! #{@name}")
