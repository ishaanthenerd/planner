import useSearch from '@/components/search/search';
import SearchBar from '@/components/search/SearchBar';
import React from 'react';
import DraggableCourse from './DraggableCourse';
import DraggableCourseContainer from './DraggableCourseContainer';
import RequirementContainerHeader from './RequirementContainerHeader';

export default function RequirementContainer({
  data,
  requirementIdx,
  accordian,
  carousel,
  setCarousel,
}) {
  // TODO: Change this later
  const getCourses = async () => {
    const temp = data[requirementIdx].courses;
    const hi = temp.map((elm, idx) => {
      return { catalogCode: elm };
    });
    return hi;
  };

  // TODO: Move to utils file
  const getCreditHours = (data) => {
    return data[requirementIdx].validCourses.length > 0
      ? sumList(
          Object.values(
            data[requirementIdx].validCourses.map((elm, idx) => {
              return parseInt(elm.split(' ')[1].substring(1, 2));
            }),
          ),
        )
      : 0;
  };

  const sumList = (values) => {
    return values.reduce((prev: number, curr: number) => prev + curr);
  };

  const { results, updateQuery, getResults, err } = useSearch({
    getData: getCourses,
    initialQuery: '',
    filterFn: (elm: string, query) =>
      elm['catalogCode'].toLowerCase().includes(query.toLowerCase()),
    constraints: [0, 5],
  });

  const numCredits = getCreditHours(data);
  const description =
    'CS guided electives are 4000 level CS courses approved by the students CS advisor. Thefollowing courses may be used as guided electives without the explicit approval of an advisor.';

  // TODO: Make better solution to update results when carousel changes
  React.useEffect(() => {
    updateQuery('');
  }, [requirementIdx]);
  return (
    <>
      <RequirementContainerHeader
        data={data}
        numCredits={numCredits}
        requirementIdx={requirementIdx}
        setCarousel={setCarousel}
      />
      <div className="text-[11px]">{description}</div>
      <SearchBar updateQuery={updateQuery} />
      <DraggableCourseContainer results={results} />
    </>
  );
}
