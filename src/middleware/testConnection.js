const client = require('./esClient');

async function run () {
  try {
    // Let's start by indexing some data
    await client.index({
      index: 'test-index',
      body: {
        character: 'Ned Stark',
        quote: 'Winter is coming.'
      }
    });

    // We need to force an index refresh at this point, as we want to
    // immediately search and get our document back.
    await client.indices.refresh({ index: 'test-index' });

    // Let's search!
    const { body } = await client.search({
      index: 'test-index',
      body: {
        query: {
          match: { quote: 'winter' }
        }
      }
    });

    if (body && body.hits && body.hits.hits) {
      console.log(body.hits.hits);
    } else {
      // Log the entire body if the structure is not as expected
      console.log("Unexpected response structure:", body);
    }
  } catch (error) {
    console.error("An error occurred:", error.meta ? error.meta.body : error);
  }
}

run();
